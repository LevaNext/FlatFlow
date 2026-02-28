import { useState } from "react";

function App(): React.ReactElement {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">FlatFlow MVP</h1>
      <p className="text-muted-foreground mb-6">
        Vite + React + TypeScript + Tailwind + Shadcn UI
      </p>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        count is {count}
      </button>
      <p className="mt-4 text-sm text-muted-foreground">
        Add{" "}
        <code className="bg-muted px-1 rounded">class=&quot;dark&quot;</code> to{" "}
        <code className="bg-muted px-1 rounded">&lt;html&gt;</code> for dark
        mode.
      </p>
    </div>
  );
}

export default App;
