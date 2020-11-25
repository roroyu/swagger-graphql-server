// const gatewaySchema = stitchSchemas({
//     // subschemas: [ schema, extendedSchema ],
//     subschemas: [ schema ],
//     // mergeTypes: true, // << optional in v7
//     typeDefs: `
//       extend type Poem {
//         author_info: [Author]
//       }
//     `,
//     resolvers: {
//       Poem: {  
//         author_info: {
//           fragment: `... on Poem { author }`,
//           resolve: (parent, args, context, info) => {
//               console.log('parent: ', parent.author)
//               console.log('args: ', args)
//               // console.log('context: ', context)
//               // console.log('info: ', info.schema)
//               const author_like = parent.author;
//               // return info.mergeInfo.delegateToSchema({
//               return delegateToSchema({
//                   schema: info.schema,
//                   // operation: 'getAuthor',
//                   operation: 'query',
//                   // fieldName: 'author_like',
//                   fieldName: 'getAuthor',
//                   args: { author_like },
//                   context,
//                   info
//               })
//           }
//         }, 
//       },
//     }},
//   )

const { stitchSchemas }  = require('@graphql-tools/stitch');
const { mergeSchemas }  = require('@graphql-tools/merge');
const { makeExecutableSchema, delegateToSchema } = require('graphql-tools')

const gatewaySchema = schemas => {
  return stitchSchemas({
    // subschemas: [ schema, extendedSchema ],
    // subschemas: [ schema ],
    subschemas: schemas,
    // mergeTypes: true, // << optional in v7
    typeDefs: `
    extend type Poem {
      author_info: Author
    }
    extend type Author {
      poems: [Poem]
    }
    `,
    resolvers: {
      Poem: {  
        author_info: {
          fragment: `... on Poem { author }`,
          resolve: async (parent, args, context, info) => {
              console.log('parent: ', parent.author)
              const author = parent.author;
              // return info.mergeInfo.delegateToSchema({
              const res = await delegateToSchema({
                schema: info.schema,
                // operation: 'getAuthor',
                operation: 'query',
                // fieldName: 'author_like',
                fieldName: 'getAuthor',
                args: { author_like: author },
                context,
                info
              })
              console.log('res: ', res.length)
              if (res.length >= 1) {
                return res[0]
              }
              return null
              // return delegateToSchema({
              //     schema: info.schema,
              //     // operation: 'getAuthor',
              //     operation: 'query',
              //     // fieldName: 'author_like',
              //     fieldName: 'get_country',
              //     args: { name: country },
              //     context,
              //     info
              // })
          }
        }, 
      },
      Author: {  
        poems: {
          fragment: `... on Author { author }`,
          resolve: (parent, args, context, info) => {
              console.log('Author_parent: ', parent.author)
              const author = parent.author;
              // return info.mergeInfo.delegateToSchema({
              // const res = await delegateToSchema({
              return delegateToSchema({
                schema: info.schema,
                // operation: 'getAuthor',
                operation: 'query',
                // fieldName: 'author_like',
                fieldName: 'get_poem',
                args: { author_like: author },
                context,
                info
              })
              // console.log('res: ', res.length)
              // if (res.length >= 1) {
              //   return res
              // }
              // return null
          }
        }, 
      },
    },
  })
}

const parsePath = path => {
  switch (path) {
    case '/countries':
      return '/country'
    default:
      return path
  }
}

const defaultQuery = `
# 查诗词
# 参数：
# author_like 作者
# paragraphs_like 包含内容
# title_like 题目
query Poem($author: String, $text: String, $title: String){
  get_poem(author_like: $author, paragraphs_like: $text, title_like: $title) {
    title
    author
    paragraphs
    author_info {
      dynasty
      # desc
    }
  }
}

# 查作者
# 参数：
# author_like 作者
# dynasty_like 朝代
query Author($author: String, $dynasty: String) {
  getAuthor(author_like: $author, dynasty_like: $dynasty){
    author
    dynasty
    # desc
    poems {
      title
      paragraphs
    }
  }
}

# 在下边 QUERY VARIABLES 中写入参数
# 例：
# {
#   "author": "",
#   "text": "",
#   "title": "",
#   "dynasty": "唐"
# }
`

module.exports =  {
  gatewaySchema,
  parsePath,
  defaultQuery,
  schemaFile: `../gm/yaml/poems.yaml`, 
}