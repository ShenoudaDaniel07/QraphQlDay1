import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLError,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} from "graphql";
import { CompanyType, UserType } from "./types.js";
import { Company, User } from "../database/models.js";

const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve(_parentValue, args) {
        let user = await User.findById(args.id);
        if (!user)
          throw new GraphQLError(`Can't find the user with id (${args.id})`);
        return user;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(_parentNode, _args, context) {
        console.log("Context:", context);
        return await User.find();
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLID } },
      async resolve(_parentValue, args) {
        let company = await Company.findById(args.id);
        if (!company)
          throw new GraphQLError(`Can't find the company with id (${args.id})`);
        return company;
      },
    },
    companies: {
      type: new GraphQLList(CompanyType),
      async resolve() {
        return await Company.find();
      },
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLID },
      },
      async resolve(_parentValue, args) {
        let company = await Company.findById(args.companyId);
        if (!company) throw new GraphQLError("Company not found");

        let user = await User.create({
          firstName: args.firstName,
          age: args.age,
          companyId: args.companyId,
        });
        return user;
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLID },
      },
      async resolve(_parentValue, args) {
        let user = await User.findById(args.id);
        if (!user)
          throw new GraphQLError(`Can't find the user with id (${args.id})`);

        if (args.companyId) {
          let company = await Company.findById(args.companyId);
          if (!company) throw new GraphQLError("Company not found");
        }

        let updatedUser = await User.findByIdAndUpdate(
          args.id,
          {
            firstName: args.firstName || user.firstName,
            age: args.age || user.age,
            companyId: args.companyId || user.companyId,
          },
          { new: true }
        );
        return updatedUser;
      },
    },
    deleteUser: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve(_parentValue, args) {
        let user = await User.findByIdAndDelete(args.id);
        if (!user)
          throw new GraphQLError(`Can't find the user with id (${args.id})`);
        return user;
      },
    },
    createCompany: {
      type: CompanyType,
      args: {
        name: { type: GraphQLString },
        slogan: { type: GraphQLString },
      },
      async resolve(_parentValue, args) {
        let company = await Company.create({
          name: args.name,
          slogan: args.slogan,
        });
        return company;
      },
    },
    updateCompany: {
      type: CompanyType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        slogan: { type: GraphQLString },
      },
      async resolve(_parentValue, args) {
        let company = await Company.findById(args.id);
        if (!company)
          throw new GraphQLError(`Can't find the company with id (${args.id})`);

        let updatedCompany = await Company.findByIdAndUpdate(
          args.id,
          {
            name: args.name || company.name,
            slogan: args.slogan || company.slogan,
          },
          { new: true }
        );
        return updatedCompany;
      },
    },
    deleteCompany: {
      type: CompanyType,
      args: { id: { type: GraphQLID } },
      async resolve(_parentValue, args) {
        let company = await Company.findByIdAndDelete(args.id);
        if (!company)
          throw new GraphQLError(`Can't find the company with id (${args.id})`);
        return company;
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
