# KickStream

Projeto academico de Computacao em Nuvem: uma plataforma web simples de catalogo de jogos de futebol usando AWS.

## Arquitetura

```text
Internet -> Application Load Balancer -> EC2 Auto Scaling Group -> Nginx -> API Node.js -> DynamoDB
```

## Estrutura

```text
public/                         Paginas HTML, CSS e JavaScript do site
api/                            API Node.js que consulta o DynamoDB
nginx/nginx.conf                Configuracao do Nginx
systemd/kickstream-api.service  Servico Linux para manter a API rodando
scripts/                        User Data, instalacao na EC2 e carga de dados
```
