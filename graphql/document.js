const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const DocumentType = new GraphQLObjectType({
    name: 'Document',
    description: 'This represents a document',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        docType: { type: new GraphQLNonNull(GraphQLString) },
        creationDate: { type: (GraphQLString) },
        updateDate: { type: (GraphQLString) },
        allowed_users: {
            type: new GraphQLList(GraphQLString)
        },
    }),
});

module.exports = DocumentType;
