"use client";

// Полная таблица Менделеева (118 элементов) для инструмента ҰБТ-режима.

const MASTER =
  "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(
    " "
  );
const Z: Record<string, number> = {};
MASTER.forEach((s, i) => (Z[s] = i + 1));

const _ = null;
// Основная таблица: 7 периодов × 18 групп
const MAIN: (string | null)[][] = [
  ["H", _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, "He"],
  ["Li", "Be", _, _, _, _, _, _, _, _, _, _, "B", "C", "N", "O", "F", "Ne"],
  ["Na", "Mg", _, _, _, _, _, _, _, _, _, _, "Al", "Si", "P", "S", "Cl", "Ar"],
  ["K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr"],
  ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe"],
  ["Cs", "Ba", "La", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn"],
  ["Fr", "Ra", "Ac", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"],
];
const LANTH = ["Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu"];
const ACTIN = ["Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr"];

// Цвет по блоку (s/p/d/f)
function color(sym: string, col: number, fBlock = false): string {
  if (fBlock) return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  if (sym === "La" || sym === "Ac") return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  if (sym === "H" || sym === "He") return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300";
  if (col <= 2) return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"; // s
  if (col >= 13) return "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"; // p
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"; // d
}

function Cell({ sym, col, fBlock = false }: { sym: string; col: number; fBlock?: boolean }) {
  return (
    <div title={`${sym} — ${Z[sym]}`} className={`flex h-7 w-7 flex-col items-center justify-center rounded ${color(sym, col, fBlock)}`}>
      <span className="text-[7px] leading-none opacity-70">{Z[sym]}</span>
      <span className="text-[10px] font-bold leading-none">{sym}</span>
    </div>
  );
}

export function PeriodicTable() {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="space-y-0.5">
          {MAIN.map((row, ri) => (
            <div key={ri} className="flex gap-0.5">
              {row.map((sym, ci) => (sym ? <Cell key={ci} sym={sym} col={ci + 1} /> : <div key={ci} className="h-7 w-7" />))}
            </div>
          ))}
          {/* f-блок */}
          <div className="flex gap-0.5 pt-1">
            <div className="h-7 w-7" /><div className="h-7 w-7" />
            {LANTH.map((s) => (<Cell key={s} sym={s} col={4} fBlock />))}
          </div>
          <div className="flex gap-0.5">
            <div className="h-7 w-7" /><div className="h-7 w-7" />
            {ACTIN.map((s) => (<Cell key={s} sym={s} col={4} fBlock />))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
        <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">s-блок</span>
        <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">d-блок</span>
        <span className="rounded bg-sky-100 px-2 py-0.5 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">p-блок</span>
        <span className="rounded bg-rose-100 px-2 py-0.5 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">f-блок</span>
      </div>
    </div>
  );
}
