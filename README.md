# Решение команды Average Strawberry Enjoyers

Мы обучили 3 нейросети: первая сегментирует изображения на листья и стебли, вторая - сегментирует на ягоды (с указанием степени развития) и цветки, третья - выполняет детекцию ячеек, в которых стоят растения.
Данный репозиторий устроен следующим образом: в каталоге train вы найдете 3 директории, соответствующие трем нейросетям. В каждой из этих директорий лежит README.md файл, в котором подробно описана инструкция по обучению каждой из моделей.
Аналогично в каталоге inference вы найдете 3 директории, соответствующие трем моделям, но уже для инференса (предсказания). Там же подробные описания, аналогично трейну.
Все модели для обучения и инференса обернуты в докер для удобства воспроизводимости.

Если что-то не получится, обращайтесь в телеграм @sorrow321
