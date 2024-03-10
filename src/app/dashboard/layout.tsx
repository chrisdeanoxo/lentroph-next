"use client";

import { useMemo } from "react";
import {
  UrqlProvider,
  ssrExchange,
  fetchExchange,
  createClient,
  gql,
} from "@urql/next";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cacheExchange } from "@urql/exchange-graphcache";
import { DashboardNavbar } from "./components/navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data, status } = useSession();
  const router = useRouter();

  if (
    status === "unauthenticated" ||
    (status === "authenticated" && !data.user.username)
  ) {
    router.push("/");
  }

  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange();
    const client = createClient({
      url: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "",
      exchanges: [
        cacheExchange({
          updates: {
            Mutation: {
              addPost(result, _args, cache, _info) {
                const PostsList = gql`
                  {
                    posts {
                      id
                    }
                  }
                `;

                cache.updateQuery({ query: PostsList }, (data) => {
                  return {
                    ...data,
                    posts: [result.addPost, ...data.posts],
                  };
                });
              },
            },
          },
        }),
        ssr,
        fetchExchange,
      ],
      suspense: true,
      fetchOptions: { cache: "no-store" },
    });

    return [client, ssr];
  }, []);

  return (
    <section className="bg-zinc-100 text-zinc-800 text-sm min-h-screen pb-24">
      <UrqlProvider client={client} ssr={ssr}>
        <DashboardNavbar />
        <div className="container mx-auto">{children}</div>
      </UrqlProvider>
    </section>
  );
}
