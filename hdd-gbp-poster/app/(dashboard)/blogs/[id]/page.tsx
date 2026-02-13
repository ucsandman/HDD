import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { BlogEditor } from './blog-editor'

interface BlogPageProps {
  params: Promise<{ id: string }>
}

export default async function BlogPage({ params }: BlogPageProps) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const { id } = await params

  const blog = await prisma.blog.findUnique({
    where: {
      id,
      franchiseId: session.user.franchiseId,
    },
  })

  if (!blog) {
    notFound()
  }

  return <BlogEditor initialBlog={blog} />
}
