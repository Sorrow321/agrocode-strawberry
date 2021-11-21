Картинки для обучения тут: https://drive.google.com/file/d/1wjdTlPqshNtWABFWnt023iNrToRIGlzL/view

Для обучения с нуля выполнить следующие шаги:
1) Скачать данные и расположить их в этой директории, чтобы они лежали примерно так:
./data/file1.jpg
./data/file2.png
...

2) git clone https://github.com/facebookresearch/detectron2
3) cd detectron2/docker
4) docker build --build-arg USER_ID=$UID -t detectron2:v0 .
5) nvidia-docker run --gpus all -it \
  --shm-size=8gb --env="DISPLAY" --volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
  --name=detectron2 -v "$PWD":/workspace detectron2:v0
6) cd /workspace
7) pip install pandas
7) python train.py

После обучения веса будут лежать в ./output под названием model_final.pth.