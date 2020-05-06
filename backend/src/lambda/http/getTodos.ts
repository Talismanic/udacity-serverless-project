import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId} from "../utils";
import {getAllTodoItems} from "../../businessLogic/allTodos";
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  // console.log('event:', event)
  logger.info('Received Event', event)
  
  const userId = getUserId(event);
  
  logger.info('Decoded User Id: ', userId)
  
  const todos = await getAllTodoItems(userId)
  logger.info('Received db data', todos)
  

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
