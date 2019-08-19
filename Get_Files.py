import json
import boto3

s3_client = boto3.client('s3')
s3_bucket = 'transcribe-processed-bucket'

def lambda_handler(event, context):
    
    object_list = s3_client.list_objects_v2(Bucket = s3_bucket)
    
    files = []
    for object in object_list['Contents']:
        key = object['Key']
        filename = key.split('.')[0]
        files.append([filename, key])
    
    results = {}
    for file in files:
        name = file[0]
        if name in results:
            results[name].append(file[1])
        else:
            results[name] = [file[1]]
            
    for result in results:
        items = len(results[result])
        if items == 1:
            results[result].append("Transcribe Processing")
        elif items == 2:
            results[result].append("Document Processing")
        elif items == 3:
            results[result].append("Completed")
    
    return {
        'statusCode': 200,
        'body': results
    }
