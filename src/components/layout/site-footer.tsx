export function SiteFooter() {
  return (
    <footer className="border-t border-border/30 py-10">
      <div className="memory-shell flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-xs tracking-wide text-muted-foreground/75 md:text-left">
          把相爱里的普通日子，认真存放在一个温柔的角落。
        </p>
        <div className="text-[10px] tracking-widest text-muted-foreground/60 uppercase font-medium">
          © {new Date().getFullYear()} OUR LITTLE UNIVERSE
        </div>
      </div>
    </footer>
  )
}
