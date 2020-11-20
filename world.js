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
      extend type Country {
          country_info: CountryInfo
      }
      `,
      resolvers: {
          Country: {  
              country_info: {
                  fragment: `... on Country { country }`,
                  resolve: async (parent, args, context, info) => {
                      console.log('parent: ', parent.author)
                      const country = parent.country;
                      // return info.mergeInfo.delegateToSchema({
                      const res = await delegateToSchema({
                        schema: info.schema,
                        // operation: 'getAuthor',
                        operation: 'query',
                        // fieldName: 'author_like',
                        fieldName: 'get_country',
                        args: { name: country },
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
      }
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
query BnR {
  get_bnr(country_like: "国") {
    country
    country_info{
#       name
      name_en
      code
      centroid
    }
  }
}

query BRICS {
  get_brics(country_like: "") {
    country
    country_info{
#       name
      name_en
      code
      centroid
    }
  }
}

query ASEAN {
  get_asean(country_like: "") {
    country
    country_info{
#       name
      name_en
      code
      centroid
    }
  }
}

query EU {
  get_eu(country_like: "") {
    country
    country_info{
#       name
      name_en
      code
      centroid
    }
  }
}
`

module.exports =  {
  gatewaySchema,
  parsePath,
  defaultQuery
}