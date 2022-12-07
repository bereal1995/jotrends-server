path=""
filename=""

if [ ${NODE_ENV} == "production" ] ; then
    path="/jotrends-server/production/"
    filename=".env.production"
else
    path="/jotrends-server/development/"
    filename=".env.development"
fi

# .env 파일 생성
touch $filename


# .env 파일에 덮어쓰기
echo DATABASE_URL=$(aws ssm get-parameters --region ap-northeast-2 --names $path"DATABASE_URL" --query Parameters[0].Value | sed 's/"//g') >> $filename
echo JWT_SECRET=$(aws ssm get-parameters --region ap-northeast-2 --names $path"JWT_SECRET" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo ALGOLIA_APP_ID=$(aws ssm get-parameters --region ap-northeast-2 --names $path"ALGOLIA_APP_ID" --query Parameters[0].Value | sed 's/"//g')  >> $filename
echo ALGOLIA_ADMIN_KEY=$(aws ssm get-parameters --region ap-northeast-2 --names $path"ALGOLIA_ADMIN_KEY" --query Parameters[0].Value | sed 's/"//g')  >> $filename
...