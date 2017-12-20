CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

   echo "== STEP 1 ==" \
&& echo "Обновляем текущий бранч" \
&& git fetch \
&& echo "Ребейзим его относительно мастера
 1) выбираем с пометкой 's' все что нужно сосквощить в предыдущий коммит
 2) выходим из режима редактирования, нажимая 'ESC'
 3) пишем ':wq', чтобы сохранить изменения ребейза
 4) 'ENTER' завершаем" \
&& git rebase -i origin/master \
&& echo "Пушим все в original c --force" \
&& git push -f \
&& echo "== STEP 2 ==" \
&& echo "Делаем master fast forward ИЗ $CURRENT_BRANCH" \
&& git fetch . $CURRENT_BRANCH:master \
&& echo "Переключаемся на master" \
&& git checkout master \
&& echo "Пушим все в origin\master" \
&& git push \
&& echo "== STEP 3 ==" \
&& echo "Запускаем publish новой версии" \
&& npm run publish-patch

