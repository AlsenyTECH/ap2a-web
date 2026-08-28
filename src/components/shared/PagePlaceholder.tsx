export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">Cette page est en cours de construction.</p>
    </div>
  )
}
