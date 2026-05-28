export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 py-8">
      <div className="memory-shell flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          把相爱里的普通日子，认真存放在一个温柔的角落。
        </p>
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 我们的小宇宙
        </div>
      </div>
    </footer>
  )
}
