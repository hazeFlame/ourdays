import { LoginForm } from "@/components/auth/login-form"
import { getSafeAuthRedirect } from "@/lib/auth-redirect"
import { redirectIfAuthenticated } from "@/lib/auth-session"

type LoginPageProps = {
  searchParams: Promise<{
    callbackURL?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const callbackURL = getSafeAuthRedirect(params.callbackURL)

  await redirectIfAuthenticated(callbackURL)

  return (
    <div className="flex flex-col h-full items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-normal">后台入口</h1>
          <p className="text-muted-foreground">登录后可以上传照片、编辑情书和维护纪念日。</p>
        </div>
        <LoginForm callbackURL={callbackURL} />
      </div>
    </div>
  )
}
