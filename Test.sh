echo "------------------------------------------------------------"
echo "Iniciando API Jogo-da-Velha por Filipe de Castro"
echo "------------------------------------------------------------"
echo "                                                            "
echo "------------------------------------------------------------"
echo "Executando testes automatizados"
echo "------------------------------------------------------------"
npm test
echo "------------------------------------------------------------"
echo "Testes finalizados. Deseja executá-lo novamente? (Y,n)"
echo "------------------------------------------------------------"
read response

while [ $response = "Y" ] || [ $response = "y" ]
do
  npm test
  echo "------------------------------------------------------------"
  echo "Testes finalizados. Deseja executá-lo novamente? (Y,n)"
  echo "------------------------------------------------------------"
  read response
done

if [ $response = "N" ] || [ $response = "n" ] ||[ $response != "Y" ]
then
  echo "------------------------------------------------------------"
  echo "Sessão de testes encerrada!"
  echo "------------------------------------------------------------"
fi

