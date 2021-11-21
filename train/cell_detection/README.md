# Детекция горшков

## Инструкция по обучению и получению весов
1. Скачайте данные для обучения по ссылке: https://drive.google.com/file/d/1d0gVYKibPk3LPHPffvjN7EgvltSCpcuC/view?usp=sharing. 
2. Расположите папку из архива cells_data в этой директории. То есть директория должна выглядеть примерно так:
```
./Dockerfile
./cells.yaml
./train.sh
./output/
./cells_data/images/
./cells_data/labels/
```
3. Сбилдите ваш докер-образ для обучения:
```bash
cd {rep}/train/cell_detection
docker build -t cell_detection:0.1 .
```
4. Запустите докер-контейнер для обучения:
```bash
cd {rep}/train/cell_detection
nvidia-docker run --ipc=host -it -v "$PWD"/cells_data:/usr/src/app/cells_data -v "$PWD"/output:/usr/src/app/runs cell_detection:0.1
```
5. Начнется процесс обучения. Во время начала вам будет предложено использовать логгер Wandb, введите 3, чтобы его не использовать (либо просто подождите 30 секунд и скрипт сам продолжит работу).
6. После окончания обучения, результаты в будут в ./output/train/expX, где X - число, соответствующее вашему последнему запуску скрипта.
7. Веса будут лежать в ./output/train/expX/weights, где X - номер последнего запуска контейнера. Взять best.pt.