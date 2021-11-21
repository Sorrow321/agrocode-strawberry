#!/bin/sh
python train.py --data cells.yaml --epochs 20 --cfg yolov5m.yaml --weights yolov5m.pt --batch-size 4