const express = require('express')
const app = express()

const graphqlHTTP = require('express-graphql').graphqlHTTP;
// import { createSchema, CallBackendArguments } from 'swagger-to-graphql';
const { createSchema, CallBackendArguments }  = require( 'swagger-to-graphql');

const { stitchSchemas }  = require('@graphql-tools/stitch');
const { mergeSchemas }  = require('@graphql-tools/merge');
const { makeExecutableSchema, delegateToSchema } = require('graphql-tools')

const fetch = require("node-fetch");

// Define your own http client here
// async function callBackend({
//   context,
//   requestOptions,
// // }: CallBackendArguments<Request>) {
// }) {
//   console.log('callBackend: ', context, requestOptions)
//   return 'Not implemented';
// }

async function callBackend({
  requestOptions: { method, body, baseUrl, path, query, headers },
}) {
  // const url = `${baseUrl}${path}?${new URLSearchParams(query as Record<
  //   string,
  //   string
  // >)}`;
  console.log('callBackend: ', { method, body, baseUrl, path, query, headers })
  const url = `${baseUrl}${path}?${new URLSearchParams(query)}`
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  console.log(text)
  if (200 <= response.status && response.status < 300) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }
  throw new Error(`Response: ${response.status} - ${text}`);
}

// yaml
createSchema({ 
  swaggerSchema: `../gm/poems.yaml`, 
  // swaggerSchema: `../gm/poems.json`, 
  callBackend,
})
  .then(schema => {
    // console.log(schema)
    // const extendedSchema = `
    //     extend type Poem {
    //       author_info: [Author!]!
    //     }
    // `;
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
    app.use(
      '/graphql',
      graphqlHTTP(() => {
        return {
          // schema,
          schema: gatewaySchema,
          // schema1,
          graphiql: true,
        };
      }),
    );

    app.listen(5003, '0.0.0.0', () => {
      console.info('http://localhost:5003/graphql');
    });
  })
  .catch(e => {
    console.log(e);
  });