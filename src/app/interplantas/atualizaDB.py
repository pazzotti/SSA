import boto3

def lambda_handler(event, context):
    # Crie uma instância do cliente do DynamoDB
    dynamodb = boto3.client('dynamodb')

    try:

        # Consulte a tabela DynamoDB para obter as colunas 'Latitude' e 'Longitude'
        response = dynamodb.scan(
            TableName='Porta_Rastreando_JSL'  # Nome da tabela DynamoDB
        )

        # Verifique se a resposta contém algum item
        if 'Items' in response and len(response['Items']) > 0:
            for item in response['Items']:
                if 'Latitude' in item and 'Longitude' in item:
                    latitude = item['Latitude'].get('S')
                    longitude = item['Longitude'].get('S')

                    # Verifique se os valores não são None
                    if latitude is not None and longitude is not None:
                        try:
                            latitude = float(latitude)
                            longitude = float(longitude)

                            # Obtenha o endereço usando o serviço de Localização da Amazon
                            address = get_address(latitude, longitude)

                            # Atualize o item no DynamoDB com o endereço
                            update_response = dynamodb.update_item(
                                TableName='Porta_Rastreando_JSL',  # Nome da tabela DynamoDB
                                Key={
                                    'ID': {'S': item['ID']['S']}
                                },
                                UpdateExpression='SET Endereco = :address',
                                ExpressionAttributeValues={
                                    ':address': {'S': address}
                                }
                            )

                        except ValueError:
                            print(f"Latitude ou longitude inválida para o item: {item['ID']['S']}")
                    else:
                        print(f"Latitude ou longitude ausentes para o item: {item['ID']['S']}")

            return 'Endereços atualizados com sucesso.'
        else:
            return 'Não foram encontrados itens na tabela DynamoDB.'

    except Exception as e:
        # Lidar com erros de consulta
        return str(e)



def get_address(latitude, longitude):
    # Crie uma instância do cliente de serviço de Localização da Amazon
    location_client = boto3.client('location')

    try:
        # Consulte o endereço com base nas coordenadas
        response = location_client.search_place_index_for_position(
            IndexName='Locais_Karrara_Transport',  # Substitua pelo nome do seu índice de lugar
            Position=[longitude, latitude],  # A ordem é [longitude, latitude]
            MaxResults=1  # Quantidade máxima de resultados desejada
        )

        # Verifique se a resposta contém algum resultado
        if 'Results' in response and len(response['Results']) > 0:
            result = response['Results'][0]
            address = result['Place']['Label']
            return address
        else:
            return 'Endereço não encontrado.'

    except Exception as e:
        # Lidar com erros de consulta
        return str(e)
