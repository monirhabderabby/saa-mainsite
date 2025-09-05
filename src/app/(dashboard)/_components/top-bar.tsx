"use client";

import { Button } from "@/components/ui/button";

interface Props {
  name: string;
}

const Topbar = ({ name }: Props) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold">SAA (Dashboard)</h1>
        <p className="text-sm text-muted-foreground">{name}</p>
      </div>

      <div>
        <Button variant="ghost">Tool 1</Button>
        <Button variant="ghost">Tool 2</Button>
        <Button variant="ghost">Tool 3</Button>
      </div>
    </header>
  );
};

export default Topbar;
