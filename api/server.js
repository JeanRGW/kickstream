import express from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const app = express();

const PORT = process.env.PORT || 3000;
const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.TABLE_NAME || 'kickstream-jogos';

const dynamoClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

function sortGames(games) {
  return games.sort((a, b) => {
    const dateA = `${a.data || ''} ${a.horario || ''}`;
    const dateB = `${b.data || ''} ${b.horario || ''}`;
    return dateA.localeCompare(dateB) || String(a.titulo || '').localeCompare(String(b.titulo || ''));
  });
}

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', table: TABLE_NAME, region: REGION });
});

app.get('/api/jogos', async (_request, response) => {
  try {
    const items = [];
    let ExclusiveStartKey;

    do {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          ExclusiveStartKey,
        }),
      );

      items.push(...(result.Items || []));
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    response.json({ items: sortGames(items) });
  } catch (error) {
    console.error('Erro ao consultar DynamoDB:', error);
    response.status(500).json({
      message: 'Nao foi possivel consultar os jogos no DynamoDB.',
    });
  }
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Rota nao encontrada.' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`KickStream API escutando em http://127.0.0.1:${PORT}`);
});
