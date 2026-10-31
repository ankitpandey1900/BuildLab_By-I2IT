import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const db = prisma as any;

function verifySignature(rawBody: string, signatureHeader: string | null, secret?: string): boolean {
  if (!secret) {
    // If webhook secret isn't configured in environment, allow testing in development
    return true;
  }
  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") {
    return false;
  }

  const expectedSignature = parts[1];
  const computedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(computedSignature, "hex")
    );
  } catch {
    return false;
  }
}

async function findStudentByGitHubOrEmail(githubUsername?: string | null, email?: string | null) {
  if (githubUsername) {
    const account = await db.account.findFirst({
      where: {
        providerId: "github",
        accountId: { equals: githubUsername, mode: "insensitive" },
      },
      include: { user: true },
    });
    if (account?.user) return account.user;
  }

  if (email) {
    const user = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (user) return user;
  }

  return null;
}

async function findProjectByRepo(repoFullName?: string | null, repoHtmlUrl?: string | null) {
  if (!repoFullName && !repoHtmlUrl) return null;

  const repoName = repoFullName ? repoFullName.split("/").pop() : "";

  return db.project.findFirst({
    where: {
      OR: [
        repoHtmlUrl ? { repositoryUrl: { equals: repoHtmlUrl, mode: "insensitive" } } : undefined,
        repoFullName ? { repositoryUrl: { contains: repoFullName, mode: "insensitive" } } : undefined,
        repoName ? { repositoryUrl: { contains: repoName, mode: "insensitive" } } : undefined,
      ].filter(Boolean) as any,
    },
  });
}

export async function POST(request: Request) {
  const deliveryId = request.headers.get("x-github-delivery") || `delivery_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const event = request.headers.get("x-github-event") || "unknown";
  const signature = request.headers.get("x-hub-signature-256");

  const rawBody = await request.text();

  // 1. Signature Verification
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  if (webhookSecret && !verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 401 });
  }

  // 2. Idempotency Check
  const existingDelivery = await db.webhookDelivery.findUnique({
    where: { id: deliveryId },
  });

  if (existingDelivery && existingDelivery.status === "processed") {
    return NextResponse.json({
      message: "Webhook event already processed.",
      deliveryId,
      status: "duplicate",
    });
  }

  // Record initial delivery
  if (!existingDelivery) {
    await db.webhookDelivery.create({
      data: {
        id: deliveryId,
        event,
        status: "received",
      },
    });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    await db.webhookDelivery.update({
      where: { id: deliveryId },
      data: { status: "error", error: "Invalid JSON payload" },
    });
    return NextResponse.json({ message: "Invalid JSON payload." }, { status: 400 });
  }

  let contributionsRecorded = 0;

  try {
    // 3. Process Webhook Event Types
    if (event === "ping") {
      await db.webhookDelivery.update({
        where: { id: deliveryId },
        data: { status: "processed", processedAt: new Date() },
      });
      return NextResponse.json({ message: "pong", zen: payload.zen, deliveryId });
    }

    const repoFullName = payload.repository?.full_name || "campus-repo";
    const repoUrl = payload.repository?.html_url;
    const project = await findProjectByRepo(repoFullName, repoUrl);

    if (event === "push") {
      const commits = Array.isArray(payload.commits) ? payload.commits : [];
      for (const commit of commits) {
        const authorUsername = commit.author?.username || payload.sender?.login;
        const authorEmail = commit.author?.email;
        const user = await findStudentByGitHubOrEmail(authorUsername, authorEmail);

        if (user) {
          const sha = commit.id || commit.sha;
          const title = (commit.message || "Commit to repository").split("\n")[0].slice(0, 150);

          // Check duplicate contribution record
          const existingContrib = await db.verifiedContribution.findFirst({
            where: {
              userId: user.id,
              type: "commit_pushed",
              sha: sha ?? undefined,
            },
          });

          if (!existingContrib) {
            await db.verifiedContribution.create({
              data: {
                userId: user.id,
                projectId: project?.id,
                type: "commit_pushed",
                title,
                repo: repoFullName,
                source: "github_webhook",
                verifiedByGitHub: true,
                externalUrl: commit.url || (repoUrl ? `${repoUrl}/commit/${sha}` : undefined),
                sha,
                deliveryId,
                details: `Branch: ${payload.ref ? payload.ref.replace("refs/heads/", "") : "main"}`,
              },
            });
            contributionsRecorded++;
          }
        }
      }
    } else if (event === "pull_request") {
      const action = payload.action;
      const isMerged = Boolean(payload.pull_request?.merged);

      if (action === "closed" && isMerged) {
        const pr = payload.pull_request;
        const authorUsername = pr.user?.login;
        const user = await findStudentByGitHubOrEmail(authorUsername);

        if (user) {
          const title = `PR #${pr.number}: ${pr.title || "Merged Pull Request"}`.slice(0, 150);
          const sha = pr.merge_commit_sha || pr.head?.sha;
          const externalUrl = pr.html_url;

          const existingContrib = await db.verifiedContribution.findFirst({
            where: {
              userId: user.id,
              type: "pr_merged",
              externalUrl,
            },
          });

          if (!existingContrib) {
            await db.verifiedContribution.create({
              data: {
                userId: user.id,
                projectId: project?.id,
                type: "pr_merged",
                title,
                repo: repoFullName,
                source: "github_webhook",
                verifiedByGitHub: true,
                externalUrl,
                sha,
                deliveryId,
                details: `Additions: +${pr.additions ?? 0}, Deletions: -${pr.deletions ?? 0}`,
              },
            });
            contributionsRecorded++;

            // Create verified notification for the student
            await db.notification.create({
              data: {
                userId: user.id,
                type: "verified_contribution",
                title: "Pull request merged & verified!",
                body: `Your PR #${pr.number} in ${repoFullName} was verified and added to your campus contribution ledger.`,
                href: "/dashboard",
              },
            });
          }
        }
      }
    } else if (event === "issues") {
      const action = payload.action;
      if (action === "closed") {
        const issue = payload.issue;
        const closerUsername = payload.sender?.login || issue.user?.login;
        const user = await findStudentByGitHubOrEmail(closerUsername);

        if (user) {
          const title = `Issue #${issue.number}: ${issue.title || "Resolved Issue"}`.slice(0, 150);
          const externalUrl = issue.html_url;

          const existingContrib = await db.verifiedContribution.findFirst({
            where: {
              userId: user.id,
              type: "issue_resolved",
              externalUrl,
            },
          });

          if (!existingContrib) {
            await db.verifiedContribution.create({
              data: {
                userId: user.id,
                projectId: project?.id,
                type: "issue_resolved",
                title,
                repo: repoFullName,
                source: "github_webhook",
                verifiedByGitHub: true,
                externalUrl,
                deliveryId,
                details: `Closed issue with ${issue.comments ?? 0} comments`,
              },
            });
            contributionsRecorded++;
          }
        }
      }
    } else if (event === "pull_request_review") {
      const action = payload.action;
      if (action === "submitted") {
        const review = payload.review;
        const reviewerUsername = review.user?.login;
        const user = await findStudentByGitHubOrEmail(reviewerUsername);

        if (user) {
          const pr = payload.pull_request;
          const title = `Code review on PR #${pr.number}: ${pr.title || "Pull Request"}`.slice(0, 150);
          const externalUrl = review.html_url || pr.html_url;

          const existingContrib = await db.verifiedContribution.findFirst({
            where: {
              userId: user.id,
              type: "code_review",
              externalUrl,
            },
          });

          if (!existingContrib) {
            await db.verifiedContribution.create({
              data: {
                userId: user.id,
                projectId: project?.id,
                type: "code_review",
                title,
                repo: repoFullName,
                source: "github_webhook",
                verifiedByGitHub: true,
                externalUrl,
                deliveryId,
                details: `State: ${review.state || "commented"}`,
              },
            });
            contributionsRecorded++;
          }
        }
      }
    }

    // Mark delivery as processed
    await db.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: "processed",
        processedAt: new Date(),
      },
    });

    // Log audit event
    await db.auditEvent.create({
      data: {
        action: "github.webhook_processed",
        target: event,
        metadata: {
          deliveryId,
          repo: repoFullName,
          contributionsRecorded,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      deliveryId,
      event,
      contributionsRecorded,
    });
  } catch (error: any) {
    console.error("GitHub webhook processing error:", error);
    await db.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: "error",
        error: error.message || "Unknown error",
      },
    });
    return NextResponse.json(
      { message: "Webhook processed with errors.", error: error.message },
      { status: 500 }
    );
  }
}
