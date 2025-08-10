"use client";

import React, { useCallback, useState, memo } from "react";

const Child = ({ label, onClick }: { label: string; onClick: () => void }) => {
  const renderCount = React.useRef(0);
  const [mounted, setMounted] = React.useState(false);
  const [clicks, setClicks] = React.useState(0);

  React.useEffect(() => {
    renderCount.current += 1;
    setMounted(true);
    console.log(`${label} → Child render #${renderCount.current}`);
  });

  const handleChildClick = () => {
    setClicks((c) => c + 1);
    onClick?.();
  };

  return (
    <div className="rounded-2xl border p-4 mt-2">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-xs opacity-60">
        render 次數：{mounted ? renderCount.current : "-"}
      </div>
      <div className="text-xs opacity-60">child clicks：{clicks}</div>
      <button
        className="mt-2 rounded-2xl border px-3 py-1.5 text-sm hover:shadow"
        onClick={handleChildClick}
      >
        觸發 onClick()
      </button>
    </div>
  );
};

const MemoChild = memo(Child);

export default function UseCallbackFourScenarios() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6">
      <h1 className="text-2xl font-semibold">
        useCallback × memo：四種情境 Demo
      </h1>
      <p className="opacity-70 mt-1 text-sm">
        每個卡片互相獨立。打開瀏覽器 Console 觀察各情境的 render 日誌。
      </p>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <ScenarioA />
        <ScenarioB />
        <ScenarioC />
        <ScenarioD />
      </div>
    </div>
  );
}

function ScenarioA() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    console.log("A.Child clicked");
  };
  return (
    <Card title="A：無 memo、無 useCallback (子一定跟著渲染)">
      <Expect
        variant="bad"
        msg="預期：子會重渲染"
        note="父層 render 不比較 props，且 onClick 每次都是新參考。"
      />
      <Expect
        variant="bad"
        msg="預期：子會重渲染"
        note="不比較 props，且 onClick 每次都是新參考"
      />
      <CounterRow count={count} onInc={() => setCount((c) => c + 1)} />
      <Child label="A.Child" onClick={handleClick} />
    </Card>
  );
}

function ScenarioB() {
  const [count, setCount] = useState(0);
  const [dep, setDep] = useState(false);
  const handleClick = useCallback(() => {
    console.log("B.Child clicked, dep=", dep);
  }, [dep]);
  return (
    <Card title="B：無 memo、有 useCallback (仍會渲染)">
      <Expect
        variant="bad"
        msg="預期：子會重渲染"
        note="沒有 memo，不做 props 比較；即使參考穩定一樣會 render。"
      />
      <Expect
        variant="bad"
        msg="預期：子會重渲染"
        note="沒有 memo 不比較 props，即使參考穩定也會渲染"
      />
      <CounterRow count={count} onInc={() => setCount((c) => c + 1)} />
      <ToggleRow
        label="切換 useCallback 依賴 dep"
        value={dep}
        onToggle={() => setDep((v) => !v)}
      />
      <Child label="B.Child (無 memo)" onClick={handleClick} />
    </Card>
  );
}

function ScenarioC() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    console.log("C.Child clicked");
  };
  return (
    <Card title="C：有 memo、無 useCallback (仍會渲染)">
      <Expect
        variant="bad"
        msg="預期：子會重渲染"
        note="有 memo 但 onClick 每次都是新參考 → props 改變。"
      />
      <Expect
        variant="bad"
        msg="預期：子會重渲染"
        note="有 memo 但 onClick 每次都是新參考 → props 改變"
      />
      <CounterRow count={count} onInc={() => setCount((c) => c + 1)} />
      <MemoChild label="C.MemoChild" onClick={handleClick} />
    </Card>
  );
}

function ScenarioD() {
  const [count, setCount] = useState(0);
  const [dep, setDep] = useState(false);
  const handleClick = useCallback(() => {}, [dep]);
  return (
    <Card title="D：有 memo、有 useCallback (理想搭配)">
      <Expect
        variant="good"
        msg="預期：子可跳過渲染"
        note="當 dep 不變時 onClick 參考穩定 → props 不變 → 跳過渲染；切換 dep 才會渲染。"
      />
      <Expect
        variant="good"
        msg="預期：子可跳過渲染"
        note="dep 不變 → 參考穩定 → props 不變 → 跳過渲染"
      />
      <CounterRow count={count} onInc={() => setCount((c) => c + 1)} />
      <ToggleRow
        label="切換 useCallback 依賴 dep (讓子重新渲染)"
        value={dep}
        onToggle={() => setDep((v) => !v)}
      />
      <MemoChild label="D.MemoChild" onClick={handleClick} />
    </Card>
  );
}

function Expect({
  msg,
  note,
  variant,
}: {
  msg: string;
  note?: string;
  variant?: "good" | "bad" | "warn";
}) {
  const bg =
    variant === "good"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      : variant === "warn"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  return (
    <div
      className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${bg}`}
    >
      <span className="font-medium">{msg}</span>
      {note ? <span className="opacity-70">— {note}</span> : null}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white/60 dark:bg-neutral-900/60">
      <h2 className="font-medium text-lg">{title}</h2>
      {children}
    </div>
  );
}

function CounterRow({ count, onInc }: { count: number; onInc: () => void }) {
  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="text-sm">
        父層 count：<span className="font-mono">{count}</span>
      </div>
      <button
        className="rounded-2xl border px-3 py-1.5 text-sm hover:shadow"
        onClick={onInc}
      >
        +1 父層重渲染
      </button>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="text-sm">
        {label}：<span className="font-mono">{String(value)}</span>
      </div>
      <button
        className="rounded-2xl border px-3 py-1.5 text-sm hover:shadow"
        onClick={onToggle}
      >
        切換
      </button>
    </div>
  );
}
