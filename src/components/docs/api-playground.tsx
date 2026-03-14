"use client";

import { useState, useCallback } from "react";
import { Play, Copy, Check, ChevronDown, ChevronUp, Clock } from "lucide-react";

interface FieldDef {
  name: string;
  type: "string" | "number" | "boolean" | "json";
  required?: boolean;
  placeholder?: string;
  description?: string;
}

interface ApiPlaygroundProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  bodySchema?: FieldDef[];
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PATCH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

export function ApiPlayground({
  method,
  endpoint,
  baseUrl = "",
  headers: defaultHeaders = {},
  bodySchema = [],
}: ApiPlaygroundProps) {
  const [headers, setHeaders] = useState<[string, string][]>(
    Object.entries(defaultHeaders).length > 0
      ? Object.entries(defaultHeaders)
      : [["Content-Type", "application/json"]]
  );
  const [body, setBody] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    body: string;
    time: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

  const fullUrl = `${baseUrl}${endpoint}`;

  const buildCurl = useCallback(() => {
    const parts = [`curl -X ${method} '${fullUrl}'`];
    for (const [k, v] of headers) {
      if (k && v) parts.push(`  -H '${k}: ${v}'`);
    }
    if (method !== "GET" && bodySchema.length > 0) {
      const bodyObj: Record<string, unknown> = {};
      for (const field of bodySchema) {
        const val = body[field.name];
        if (val !== undefined && val !== "") {
          if (field.type === "number") bodyObj[field.name] = Number(val);
          else if (field.type === "boolean") bodyObj[field.name] = val === "true";
          else if (field.type === "json") {
            try { bodyObj[field.name] = JSON.parse(val); } catch { bodyObj[field.name] = val; }
          } else bodyObj[field.name] = val;
        }
      }
      parts.push(`  -d '${JSON.stringify(bodyObj, null, 2)}'`);
    }
    return parts.join(" \\\n");
  }, [method, fullUrl, headers, body, bodySchema]);

  const copyCurl = () => {
    navigator.clipboard.writeText(buildCurl()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      const headerObj: Record<string, string> = {};
      for (const [k, v] of headers) {
        if (k && v) headerObj[k] = v;
      }

      const fetchOpts: RequestInit = { method, headers: headerObj };

      if (method !== "GET" && bodySchema.length > 0) {
        const bodyObj: Record<string, unknown> = {};
        for (const field of bodySchema) {
          const val = body[field.name];
          if (val !== undefined && val !== "") {
            if (field.type === "number") bodyObj[field.name] = Number(val);
            else if (field.type === "boolean") bodyObj[field.name] = val === "true";
            else if (field.type === "json") {
              try { bodyObj[field.name] = JSON.parse(val); } catch { bodyObj[field.name] = val; }
            } else bodyObj[field.name] = val;
          }
        }
        fetchOpts.body = JSON.stringify(bodyObj);
      }

      const res = await fetch(fullUrl, fetchOpts);
      const text = await res.text();
      const time = Math.round(performance.now() - start);

      let formattedBody = text;
      try {
        formattedBody = JSON.stringify(JSON.parse(text), null, 2);
      } catch { /* not json */ }

      setResponse({ status: res.status, statusText: res.statusText, body: formattedBody, time });
    } catch (err) {
      const time = Math.round(performance.now() - start);
      setResponse({
        status: 0,
        statusText: "Network Error",
        body: `Request failed: ${err instanceof Error ? err.message : "Unknown error"}\n\nThis may be due to CORS restrictions. Use the cURL command instead.`,
        time,
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: number) => {
    if (status === 0) return "text-red-400";
    if (status < 300) return "text-emerald-400";
    if (status < 400) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="my-6 border border-border rounded-xl overflow-hidden bg-surface">
      {/* Method + Endpoint */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/50">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${METHOD_COLORS[method]}`}>
          {method}
        </span>
        <code className="text-sm text-foreground font-mono flex-1 truncate">{endpoint}</code>
      </div>

      {/* Headers */}
      <div className="border-b border-border">
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          {showHeaders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Headers ({headers.length})
        </button>
        {showHeaders && (
          <div className="px-4 pb-3 space-y-2">
            {headers.map(([k, v], i) => (
              <div key={`header-${k}-${i}`} className="flex gap-2">
                <input
                  value={k}
                  onChange={(e) => {
                    const next = [...headers] as [string, string][];
                    next[i] = [e.target.value, next[i][1]];
                    setHeaders(next);
                  }}
                  placeholder="Header name"
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted/50 outline-none focus:border-accent-blue min-h-[44px]"
                />
                <input
                  value={v}
                  onChange={(e) => {
                    const next = [...headers] as [string, string][];
                    next[i] = [next[i][0], e.target.value];
                    setHeaders(next);
                  }}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted/50 outline-none focus:border-accent-blue min-h-[44px]"
                />
              </div>
            ))}
            <button
              onClick={() => setHeaders([...headers, ["", ""]])}
              className="text-xs text-accent-blue hover:underline"
            >
              + Add header
            </button>
          </div>
        )}
      </div>

      {/* Body Schema */}
      {method !== "GET" && bodySchema.length > 0 && (
        <div className="px-4 py-3 border-b border-border space-y-3">
          <div className="text-sm font-medium text-muted">Body</div>
          {bodySchema.map((field) => (
            <div key={field.name}>
              <label className="flex items-center gap-1.5 text-sm mb-1">
                <span className="text-foreground font-mono">{field.name}</span>
                <span className="text-muted text-xs">({field.type})</span>
                {field.required && <span className="text-red-400 text-xs">*</span>}
              </label>
              {field.description && (
                <p className="text-xs text-muted mb-1.5">{field.description}</p>
              )}
              {field.type === "boolean" ? (
                <select
                  value={body[field.name] || ""}
                  onChange={(e) => setBody({ ...body, [field.name]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground outline-none focus:border-accent-blue min-h-[44px]"
                >
                  <option value="">Select...</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : field.type === "json" ? (
                <textarea
                  value={body[field.name] || ""}
                  onChange={(e) => setBody({ ...body, [field.name]: e.target.value })}
                  placeholder={field.placeholder || '{"key": "value"}'}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground font-mono placeholder:text-muted/50 outline-none focus:border-accent-blue resize-y"
                />
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={body[field.name] || ""}
                  onChange={(e) => setBody({ ...body, [field.name]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted/50 outline-none focus:border-accent-blue min-h-[44px]"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <button
          onClick={sendRequest}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors min-h-[44px] disabled:opacity-50"
          style={{ background: `linear-gradient(to right, var(--bb-primary), var(--bb-secondary))` }}
        >
          <Play size={14} />
          {loading ? "Sending…" : "Send Request"}
        </button>
        <button
          onClick={copyCurl}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground hover:bg-background transition-colors min-h-[44px]"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy cURL"}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className="border-t border-border">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background/30">
            <span className="text-sm font-medium text-muted">Response</span>
            <span className={`text-sm font-bold ${statusColor(response.status)}`}>
              {response.status} {response.statusText}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted ml-auto">
              <Clock size={12} />
              {response.time}ms
            </span>
          </div>
          <pre className="p-4 text-sm font-mono text-foreground overflow-x-auto max-h-80 overflow-y-auto leading-relaxed">
            {response.body}
          </pre>
        </div>
      )}
    </div>
  );
}
