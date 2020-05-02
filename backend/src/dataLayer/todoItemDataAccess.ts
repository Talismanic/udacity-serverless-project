import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoItemAccess{

    constructor (
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoItemsTable = process.env.TODOITEMS_TABLE){

        }


    async getAllTodoItems(userId: String): Promise< TodoItem[] > {
        console.log(userId);
        console.log('Getting all Todo Items');
        const result = await this.docClient.query({
            TableName: this.todoItemsTable,
            IndexName: "UserIdIndex",
            ExpressionAttributeValues: {
                ':userId': userId
            }
            // KeyConditionExpression: 'userId= :userId'
        }).promise()
        const items = result.Items

        return items as TodoItem[]
    }

    async createTodoItem(todoitem: TodoItem): Promise<TodoItem>{
        await this.docClient.put({
            TableName: this.todoItemsTable,
            Item: todoitem
        }).promise()

        return todoitem;

    }

    async updateTodoItem (todoId:String, todoUpdate:TodoUpdate): Promise<TodoUpdate>{

       await this.docClient.update({
            TableName: this.todoItemsTable,
            Key: {"todoId":todoId},
            UpdateExpression: "set name = :name, dueDate= :dueDate, done= :done",
            ExpressionAttributeValues:{
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return todoUpdate;

    }


    async deleteTodoItem (todoId: String){
        await this.docClient.delete({
            TableName: this.todoItemsTable,
            Key: {"todoId":todoId}
        }).promise()
    }


    async imageUpload(todoId: string, imageId: string){
        const s3Bucket = process.env.S3_BUCKET
        const urlExpiry = process.env.SIGNED_URL_EXPIRATION

        const s3 = new AWS.S3({
            signatureVersion: "v4"
        });

        const baseUrl = s3.getSignedUrl('putObject',{
            Bucket: s3Bucket,
            Key: imageId,
            Expires: urlExpiry
        })

        const imageUrl = `https://${s3Bucket}.s3.amazonaws.com/${imageId}`

        await this.docClient.update({
            TableName: this.todoItemsTable,
            Key:{todoId: todoId},
            UpdateExpression: 'set attachmentUrl = :url',
            ExpressionAttributeValues:{
                ":url":imageUrl
            },
            ReturnValues:"UPDATED_NEW"

        }).promise()

        return{
            imageUrl: imageUrl,
            signedUploadUrl: baseUrl
        }


    }


                   
        
    
    
}




function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  
  export default new TodoItemAccess()