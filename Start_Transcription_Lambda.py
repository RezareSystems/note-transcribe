import json
import boto3

s3_client = boto3.resource('s3')
transcribe_client = boto3.client("transcribe")
dest_bucket = s3_client.Bucket('transcribe-processed-bucket')

def start_transcription(job_name, media_uri, media_extension):
    print('starting transcription job')
    print(media_uri)
    return transcribe_client.start_transcription_job(
        TranscriptionJobName = job_name,
        LanguageCode = 'en-GB',
        MediaFormat=media_extension,
        Media={
            'MediaFileUri': media_uri
        },
        OutputBucketName=dest_bucket.name,
        Settings={
            'ShowSpeakerLabels': True,
            'MaxSpeakerLabels': 10
        })

def lambda_handler(event, context):
    i = 0
    for rechord in event['Records']:
        bucket = rechord['s3']['bucket']['name']
        key = rechord['s3']['object']['key']
        print(bucket)
        print(key)
        extension = key.split('.')[-1]
        job_name = key.split('.')[0]
        print(extension)
        i += 1
        
        if extension == 'mp4' or extension == 'mp3' or extension == 'wav':
            media_uri = 'https://s3.amazonaws.com/' + bucket + '/' + key
            start_transcription(job_name, media_uri, extension)
            
        s3_client.Object(dest_bucket.name, key).copy_from(CopySource= {'Bucket': bucket, 'Key': key})
        
    return {
        'statusCode': 200,
        'body': json.dumps(str(i) + ' Files Processed')
    }
