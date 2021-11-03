const { GraphQLObjectType } = require('graphql');
const UserType = require("./user.js");
const user = require("../models/auth.model.js");

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        user: {
            type: UserType,
            resolve: async function (parent, args, request) {
                const emailQuery = {
                    email: request.user.email
                };
                const res = await user.login(emailQuery);

                return res;
            }
        },
    })
});

module.exports = RootQueryType;
