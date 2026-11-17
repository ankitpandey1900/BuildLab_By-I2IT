"use client";

import React, { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

interface DepartmentMetrics {
  total: number;
  verified: number;
}

interface CommitTrendMetric {
  department: string;
  month: string;
  commits: number;
  isDemoData: boolean;
}

interface AccreditationMetrics {
  totalStudents: number;
  verifiedStudents: number;
  byDepartment: Record<string, DepartmentMetrics>;
  totalVerifiedContributions: number;
  commitTrend: CommitTrendMetric[];
}

type ChartMarker = "circle" | "square" | "diamond";

function isAccreditationMetrics(value: unknown): value is AccreditationMetrics {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.totalStudents !== "number" ||
    typeof candidate.verifiedStudents !== "number" ||
    typeof candidate.totalVerifiedContributions !== "number" ||
    !Array.isArray(candidate.commitTrend) ||
    typeof candidate.byDepartment !== "object" ||
    candidate.byDepartment === null ||
    Array.isArray(candidate.byDepartment)
  ) {
    return false;
  }

  return Object.values(candidate.byDepartment as Record<string, unknown>).every((entry) => {
    if (typeof entry !== "object" || entry === null) return false;
    const department = entry as Record<string, unknown>;
    return (
      typeof department.total === "number" &&
      typeof department.verified === "number"
    );
  }) && candidate.commitTrend.every((entry) => {
    if (typeof entry !== "object" || entry === null) return false;
    const trend = entry as Record<string, unknown>;
    return (
      typeof trend.department === "string" &&
      typeof trend.month === "string" &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(trend.month) &&
      typeof trend.commits === "number" &&
      Number.isSafeInteger(trend.commits) &&
      trend.commits >= 0 &&
      typeof trend.isDemoData === "boolean"
    );
  });
}

function getApiMessage(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null || !("message" in payload)) {
    return undefined;
  }
  return typeof payload.message === "string" ? payload.message : undefined;
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-IN").format(value);

const collegeDepartments = [
  {
    id: "ce",
    shortLabel: "CE",
    label: "Computer Engineering",
    matches: (name: string) => /computer|\bce\b/i.test(name),
    colorClass: "text-emerald-700 dark:text-emerald-400",
    dashArray: undefined,
    marker: "circle",
  },
  {
    id: "it",
    shortLabel: "IT",
    label: "Information Technology",
    matches: (name: string) => /information technology|\bit\b/i.test(name),
    colorClass: "text-amber-700 dark:text-amber-400",
    dashArray: "7 5",
    marker: "square",
  },
  {
    id: "entc",
    shortLabel: "E&TC",
    label: "Electronics & Telecommunication",
    matches: (name: string) => /entc|electronics.*telecommunication/i.test(name),
    colorClass: "text-violet-700 dark:text-violet-400",
    dashArray: "2 5",
    marker: "diamond",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  shortLabel: string;
  label: string;
  matches: (name: string) => boolean;
  colorClass: string;
  dashArray: string | undefined;
  marker: ChartMarker;
}>;

const monthFormatters = {
  full: new Intl.DateTimeFormat("en", { month: "short", year: "2-digit", timeZone: "UTC" }),
  compact: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }),
};

function formatMonth(month: string, compact: boolean) {
  return (compact ? monthFormatters.compact : monthFormatters.full).format(
    new Date(`${month}-01T00:00:00Z`)
  );
}

export const AdminMetricsOverview: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<AccreditationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [chartWidth, setChartWidth] = useState(720);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      if (width > 0) setChartWidth(width);
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [metrics]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const loadMetrics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/metrics/accreditation", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(getApiMessage(payload) ?? `Could not load metrics (${response.status}).`);
        }
        if (!isAccreditationMetrics(payload)) {
          throw new Error("The accreditation metrics response was incomplete.");
        }
        if (active) setMetrics(payload);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        const message =
          loadError instanceof Error ? loadError.message : "Could not load accreditation metrics.";
        if (active) setError(message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadMetrics();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadVersion]);

  const verifiedRate =
    metrics && metrics.totalStudents > 0
      ? Math.min(100, Math.round((metrics.verifiedStudents / metrics.totalStudents) * 100))
      : null;
  const departments = metrics
    ? collegeDepartments.map(({ label, matches }) => {
        const values = Object.entries(metrics.byDepartment)
          .filter(([name]) => matches(name))
          .reduce<DepartmentMetrics>(
            (total, [, department]) => ({
              total: total.total + department.total,
              verified: total.verified + department.verified,
            }),
            { total: 0, verified: 0 }
          );
        return { label, ...values };
      })
    : [];
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const months = Array.from({ length: 12 }, (_, index) =>
    new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 11 + index, 1)
    ).toISOString().slice(0, 7)
  );
  const commitSeries = metrics
    ? collegeDepartments.map((department) => ({
        ...department,
        values: months.map((month) =>
          metrics.commitTrend
            .filter(
              (entry) => entry.month === month && department.matches(entry.department)
            )
            .reduce((total, entry) => total + entry.commits, 0)
        ),
      }))
    : [];
  const totalCommitCount = commitSeries.reduce(
    (total, series) => total + series.values.reduce((seriesTotal, value) => seriesTotal + value, 0),
    0
  );
  const hasDemoSamples = metrics?.commitTrend.some((entry) => entry.isDemoData) ?? false;
  const leadingSeries = commitSeries.reduce<(typeof commitSeries)[number] | null>(
    (leader, series) => {
      const count = series.values.reduce((total, value) => total + value, 0);
      const leaderCount = leader?.values.reduce((total, value) => total + value, 0) ?? -1;
      return count > leaderCount ? series : leader;
    },
    null
  );
  const leadingSeriesCount =
    leadingSeries?.values.reduce((total, value) => total + value, 0) ?? 0;
  const trendSummary =
    totalCommitCount > 0 && leadingSeries
      ? `${formatNumber(totalCommitCount)} ${
          totalCommitCount === 1 ? "commit" : "commits"
        } recorded in the last 12 months. ${leadingSeries.shortLabel} leads with ${formatNumber(
          leadingSeriesCount
        )}.`
      : "No student push activity recorded in the last 12 months.";

  const chartHeight = 280;
  const plotTop = 18;
  const plotBottom = 232;
  const plotLeft = chartWidth < 480 ? 34 : 50;
  const plotRight = Math.max(plotLeft + 1, chartWidth - 12);
  const plotHeight = plotBottom - plotTop;
  const peakCommitCount = Math.max(0, ...commitSeries.flatMap((series) => series.values));
  const yAxisMax = Math.max(4, Math.ceil(peakCommitCount / 4) * 4);
  const yTicks = Array.from({ length: 5 }, (_, index) => (yAxisMax * index) / 4);
  const chartSeries = commitSeries.map((series) => {
    const points = series.values.map((value, index) => ({
      x: plotLeft + (index / (months.length - 1)) * (plotRight - plotLeft),
      y: plotBottom - (value / yAxisMax) * plotHeight,
      value,
      month: months[index],
    }));
    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    return {
      ...series,
      points,
      linePath,
      areaPath: `${linePath} L ${lastPoint.x} ${plotBottom} L ${firstPoint.x} ${plotBottom} Z`,
      total: series.values.reduce((total, value) => total + value, 0),
    };
  });
  const compactChart = chartWidth < 520;
  const visibleMonthIndexes = months
    .map((_, index) => index)
    .filter(
      (index) =>
        !compactChart ||
        (index % 2 === 0 && index < months.length - 2) ||
        index === months.length - 1
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[var(--text-pure)]">Accreditation</h2>
        <button
          type="button"
          onClick={() => setReloadVersion((version) => version + 1)}
          disabled={isLoading}
          className="btn btn-secondary btn-sm min-h-10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 border-l-2 border-rose-400 bg-rose-500/5 px-4 py-3 text-sm text-rose-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          {!metrics && (
            <button
              type="button"
              onClick={() => setReloadVersion((version) => version + 1)}
              className="btn btn-secondary btn-sm min-h-10 shrink-0 border-rose-500/30 text-rose-200"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {isLoading && !metrics ? (
        <div role="status" className="border-y border-[var(--border-subtle)] py-12 text-center text-sm text-[var(--text-secondary)]">
          <RefreshCw size={17} className="mx-auto mb-2 animate-spin text-emerald-400" aria-hidden="true" />
          Loading accreditation data…
        </div>
      ) : metrics ? (
        <>
          <section
            aria-label="Student verification summary"
            className="grid border-y border-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-[var(--border-subtle)]"
          >
            <div className="px-4 py-4 sm:pl-0">
              <p className="text-sm text-[var(--text-secondary)]">Campus verified</p>
              <p className="mt-1 flex items-baseline gap-2 tabular-nums">
                <span className="text-3xl font-semibold tracking-tight text-[var(--text-pure)]">
                  {formatNumber(metrics.verifiedStudents)}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  of {formatNumber(metrics.totalStudents)} · {verifiedRate === null ? "—" : `${verifiedRate}%`}
                </span>
              </p>
              <div
                className="mt-3 h-1 overflow-hidden bg-[var(--bg-surface-elevated)]"
                role="progressbar"
                aria-label="Student verification rate"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={verifiedRate ?? 0}
                aria-valuetext={verifiedRate === null ? "No student records" : `${verifiedRate}% verified`}
              >
                <div
                  className="h-full bg-emerald-500 transition-[width] duration-300"
                  style={{ width: `${verifiedRate ?? 0}%` }}
                />
              </div>
            </div>
            <div className="border-t border-[var(--border-subtle)] px-4 py-4 sm:border-t-0 sm:pl-6">
              <p className="text-sm text-[var(--text-secondary)]">Student accounts</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-[var(--text-pure)]">
                {formatNumber(metrics.totalStudents)}
              </p>
            </div>
            <div className="border-t border-[var(--border-subtle)] px-4 py-4 sm:border-t-0 sm:pl-6">
              <p className="text-sm text-[var(--text-secondary)]">Verified contributions</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-[var(--text-pure)]">
                {formatNumber(metrics.totalVerifiedContributions)}
              </p>
            </div>
          </section>

          <section aria-labelledby="department-register-heading">
            <div className="py-2">
              <h3 id="department-register-heading" className="text-sm font-semibold text-[var(--text-pure)]">
                Department verification
              </h3>
            </div>

            {departments.length === 0 ? (
              <p className="border-y border-[var(--border-subtle)] py-8 text-center text-sm text-[var(--text-secondary)]">
                No department verification records yet.
              </p>
            ) : (
              <div className="overflow-x-auto border-y border-[var(--border-subtle)]">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">Student verification rate by department</caption>
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                      <th scope="col" className="py-3 pr-4 font-medium">Department</th>
                      <th scope="col" className="py-3 pl-4 font-medium">Verified rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {departments.map(({ label, total, verified }) => {
                      const rate =
                        total > 0 ? Math.min(100, Math.round((verified / total) * 100)) : null;

                      return (
                        <tr key={label} className="hover:bg-[var(--bg-surface-elevated)]/50">
                          <th scope="row" className="py-3 pr-4 font-medium text-[var(--text-pure)]">
                            {label}
                          </th>
                          <td className="py-3 pl-4">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span className="text-[var(--text-secondary)]">
                                {total > 0
                                  ? `${formatNumber(verified)} of ${formatNumber(total)} students`
                                  : "No student records"}
                              </span>
                              <span className="shrink-0 font-medium tabular-nums text-[var(--text-pure)]">
                                {rate === null ? "—" : `${rate}%`}
                              </span>
                            </div>
                            <div
                              className="mt-2 h-1 overflow-hidden bg-[var(--bg-surface-elevated)]"
                              role="progressbar"
                              aria-label={`${label} student verification rate`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={rate ?? 0}
                              aria-valuetext={
                                rate === null
                                  ? "No student records"
                                  : `${rate}% (${formatNumber(verified)} of ${formatNumber(total)} students)`
                              }
                            >
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${rate ?? 0}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section
            aria-labelledby="department-commits-heading"
            className="border-t border-[var(--border-subtle)] pt-4"
          >
            <div className="mb-4">
              <h3
                id="department-commits-heading"
                className="text-sm font-semibold text-[var(--text-pure)]"
              >
                Department commit activity
              </h3>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{trendSummary}</p>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                {hasDemoSamples
                  ? "Includes clearly marked seed examples alongside GitHub-verified pushes."
                  : "GitHub-verified student pushes."}
              </p>
            </div>

            <div ref={chartContainerRef} className="w-full">
              <svg
                role="img"
                aria-labelledby="commit-chart-title commit-chart-description"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="block h-[280px] w-full"
              >
                <title id="commit-chart-title">Monthly commits by department</title>
                <desc id="commit-chart-description">
                  Student commit activity over the last 12 months.{" "}
                  {hasDemoSamples ? "This includes seeded demo samples." : ""}
                  Departments use distinct line styles, marker shapes, and colors.
                </desc>

                <g aria-hidden="true">
                  {yTicks.map((tick) => {
                    const y = plotBottom - (tick / yAxisMax) * plotHeight;
                    return (
                      <g key={tick}>
                        <line
                          x1={plotLeft}
                          y1={y}
                          x2={plotRight}
                          y2={y}
                          stroke="var(--border-subtle)"
                          strokeDasharray="3 5"
                        />
                        <text
                          x={plotLeft - 8}
                          y={y + 4}
                          textAnchor="end"
                          fill="var(--text-tertiary)"
                          fontSize={compactChart ? 10 : 12}
                        >
                          {formatNumber(tick)}
                        </text>
                      </g>
                    );
                  })}
                  {visibleMonthIndexes.map((index) => {
                    const x =
                      plotLeft + (index / (months.length - 1)) * (plotRight - plotLeft);
                    return (
                      <text
                        key={months[index]}
                        x={x}
                        y={chartHeight - 8}
                        textAnchor={
                          index === 0 ? "start" : index === months.length - 1 ? "end" : "middle"
                        }
                        fill="var(--text-tertiary)"
                        fontSize={compactChart ? 10 : 12}
                      >
                        {formatMonth(months[index], true)}
                      </text>
                    );
                  })}
                </g>

                {chartSeries.map((series) => (
                  <g key={series.id} className={series.colorClass}>
                    <path
                      d={series.areaPath}
                      fill="currentColor"
                      fillOpacity={0.12}
                      aria-hidden="true"
                    />
                    <path
                      d={series.linePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.25}
                      strokeDasharray={series.dashArray}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    {series.points.map((point) => (
                      <g key={point.month}>
                        <title>
                          {series.label}, {formatMonth(point.month, false)}:{" "}
                          {formatNumber(point.value)}{" "}
                          {point.value === 1 ? "commit" : "commits"}
                        </title>
                        {series.marker === "circle" ? (
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={3.5}
                            fill="currentColor"
                            stroke="var(--bg-surface)"
                            strokeWidth={1.5}
                          />
                        ) : series.marker === "square" ? (
                          <rect
                            x={point.x - 3.5}
                            y={point.y - 3.5}
                            width={7}
                            height={7}
                            rx={1}
                            fill="currentColor"
                            stroke="var(--bg-surface)"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <path
                            d={`M ${point.x} ${point.y - 4.5} L ${point.x + 4.5} ${point.y} L ${point.x} ${point.y + 4.5} L ${point.x - 4.5} ${point.y} Z`}
                            fill="currentColor"
                            stroke="var(--bg-surface)"
                            strokeWidth={1.5}
                          />
                        )}
                      </g>
                    ))}
                  </g>
                ))}
              </svg>
            </div>

            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--border-subtle)] pt-3">
              {chartSeries.map((series) => (
                <li
                  key={series.id}
                  className={`inline-flex items-center gap-2 text-xs ${series.colorClass}`}
                >
                  <svg aria-hidden="true" width="32" height="12" viewBox="0 0 32 12">
                    <line
                      x1="1"
                      y1="6"
                      x2="31"
                      y2="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={series.dashArray}
                    />
                    {series.marker === "circle" ? (
                      <circle cx="16" cy="6" r="3" fill="currentColor" />
                    ) : series.marker === "square" ? (
                      <rect x="13" y="3" width="6" height="6" rx="1" fill="currentColor" />
                    ) : (
                      <path d="M 16 2 L 20 6 L 16 10 L 12 6 Z" fill="currentColor" />
                    )}
                  </svg>
                  <span>{series.label}</span>
                  <span className="tabular-nums text-[var(--text-secondary)]">
                    {formatNumber(series.total)}
                  </span>
                </li>
              ))}
            </ul>

            <details className="mt-3 border-t border-[var(--border-subtle)]">
              <summary className="min-h-11 cursor-pointer py-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-pure)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
                View monthly values
              </summary>
              <table className="mb-3 w-full border-collapse text-xs">
                <caption className="sr-only">
                  Monthly verified commit counts by department for the last 12 months
                </caption>
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    <th scope="col" className="py-2 text-left font-medium">Month</th>
                    {chartSeries.map((series) => (
                      <th
                        key={series.id}
                        scope="col"
                        aria-label={series.label}
                        className="px-2 py-2 text-right font-medium"
                      >
                        {series.shortLabel}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {months.map((month, index) => (
                    <tr key={month}>
                      <th scope="row" className="py-2 text-left font-normal text-[var(--text-secondary)]">
                        {formatMonth(month, false)}
                      </th>
                      {chartSeries.map((series) => (
                        <td key={series.id} className="px-2 py-2 text-right tabular-nums">
                          {formatNumber(series.values[index])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>
        </>
      ) : null}
    </div>
  );
};
