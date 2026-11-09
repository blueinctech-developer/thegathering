"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash } from "@phosphor-icons/react";

/** Up / down / delete controls for an ordered item. Delete asks for a second click instead of a browser dialog. */
export function RowActions({
  id,
  move,
  remove,
  label,
}: {
  id: number | string;
  move?: (data: FormData) => Promise<void>;
  remove?: (data: FormData) => Promise<void>;
  label: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const btn = "grid size-9 place-items-center rounded-full border border-line text-ink-2 hover:border-ink hover:text-ink";
  return (
    <div className="flex items-center gap-1.5">
      {move && (
        <>
          <form action={move}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="dir" value="up" />
            <button className={btn} aria-label={`Move ${label} up`}><ArrowUp size={16} /></button>
          </form>
          <form action={move}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="dir" value="down" />
            <button className={btn} aria-label={`Move ${label} down`}><ArrowDown size={16} /></button>
          </form>
        </>
      )}
      {remove &&
        (confirming ? (
          <form action={remove} className="flex items-center gap-1.5">
            <input type="hidden" name="id" value={id} />
            <button className="rounded-full bg-[#b42318] px-3 py-1.5 text-sm font-semibold text-white">Delete</button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-3 py-1.5 text-sm text-ink-2 hover:text-ink">
              Cancel
            </button>
          </form>
        ) : (
          <button type="button" className={btn} aria-label={`Delete ${label}`} onClick={() => setConfirming(true)}>
            <Trash size={16} />
          </button>
        ))}
    </div>
  );
}
