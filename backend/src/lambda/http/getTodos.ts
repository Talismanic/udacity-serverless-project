import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId} from "../utils";
import {getAllTodoItems} from "../../businessLogic/allTodos";




export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  console.log('event:', event)
  
  const userId = getUserId(event);

  const todos = await getAllTodoItems(userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      todos
    })
  }

}
