{
  echo "===== npm run build ====="
  npm run build

  echo "===== npm run lint ====="
  npm run lint

  echo "===== npm run db:test:setup ====="
  npm run db:test:setup

  echo "===== npm test ====="
  npm test
} 2>&1 | tee ../docs/semana-3-validacion-aws.txt
