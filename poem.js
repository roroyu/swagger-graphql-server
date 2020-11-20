const gatewaySchema = stitchSchemas({
    // subschemas: [ schema, extendedSchema ],
    subschemas: [ schema ],
    // mergeTypes: true, // << optional in v7
    typeDefs: `
      extend type Poem {
        author_info: [Author]
      }
    `,
    resolvers: {
      Poem: {  
        author_info: {
          fragment: `... on Poem { author }`,
          resolve: (parent, args, context, info) => {
              console.log('parent: ', parent.author)
              console.log('args: ', args)
              // console.log('context: ', context)
              // console.log('info: ', info.schema)
              const author_like = parent.author;
              // return info.mergeInfo.delegateToSchema({
              return delegateToSchema({
                  schema: info.schema,
                  // operation: 'getAuthor',
                  operation: 'query',
                  // fieldName: 'author_like',
                  fieldName: 'getAuthor',
                  args: { author_like },
                  context,
                  info
              })
          }
        }, 
      },
    }},
  )