import prisma from "@/lib/db";
import builder from "../builder";

builder.prismaObject("Organization", {
  fields: (t) => ({
    id: t.exposeID("id"),
    isApproved: t.exposeBoolean("isApproved"),
    username: t.exposeString("username"),
    name: t.exposeString("name"),
    bio: t.exposeString("bio"),
    createdAt: t.expose("createdAt", {
      type: "Date",
    }),
    updatedAt: t.expose("updatedAt", {
      type: "Date",
      nullable: true,
    }),
    owner: t.relation("owner"),
    donations: t.relation("donations"),
  }),
});

builder.queryFields((t) => ({
  orgs: t.prismaField({
    type: ["Organization"],
    resolve: async () => {
      try {
        const orgs = await prisma?.organization.findMany();
        return orgs;
      } catch (err) {
        throw err;
      }
    },
  }),
}));

const AddOrgInput = builder.inputType("AddOrgInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    username: t.string({ required: true }),
    bio: t.string({ required: true }),
  }),
});

builder.mutationFields((t) => ({
  addOrg: t.prismaField({
    type: "Organization",
    args: {
      input: t.arg({ type: AddOrgInput, required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      try {
        const org = await prisma.organization.create({
          data: {
            owner: {
              connect: {
                id: ctx.userId,
              },
            },
            ...args.input,
          },
        });

        return org;
      } catch (err) {
        throw err;
      }
    },
  }),
}));
