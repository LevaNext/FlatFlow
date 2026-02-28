import { useState } from "react";
import { Button } from "@/components/ui/button";

function App(): React.ReactElement {
  const [count, setCount] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-foreground">
      <h1 className="mb-4 text-3xl font-bold">FlatFlow MVP</h1>
      <p className="mb-6 text-muted-foreground">
        Vite + React + TypeScript + Tailwind + Shadcn UI
      </p>
      <Button onClick={() => setCount((c) => c + 1)}>count is {count}</Button>
      <p className="mt-4 text-sm text-muted-foreground">
        Add{" "}
        <code className="rounded bg-muted px-1">class=&quot;dark&quot;</code> to{" "}
        <code className="rounded bg-muted px-1">&lt;html&gt;</code> for dark
        mode.
      </p>
    </div>
  );
}

export default App;
