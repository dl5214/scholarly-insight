// src/app/forum/[postId]/page.tsx
import DiscussionClient from '@/components/DiscussionClient'

export default function Page(props: any) {
    // Next’s generated PageProps doesn’t match your own, so we just
    // treat it as any and pull out params.id directly.
    const postId = props.params.postId as string
    return <DiscussionClient postId={postId} />
}