const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');
const DocumentType = require("./document.js");

const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'This represents a user',
    fields: () => {
        return {
            _id: { type: new GraphQLNonNull(GraphQLString) },
            firstName: { type: new GraphQLNonNull(GraphQLString) },
            lastName: { type: new GraphQLNonNull(GraphQLString) },
            email: { type: new GraphQLNonNull(GraphQLString) },
            updateDate: { type: new GraphQLNonNull(GraphQLString) },
            docs: {
                type: new GraphQLList(DocumentType)
            },
        };
    },
});

module.exports = UserType;
