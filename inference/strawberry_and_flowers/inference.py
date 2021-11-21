import random
import cv2
import os

from pathlib import Path

from detectron2.data import DatasetCatalog, MetadataCatalog
from detectron2.structures import BoxMode
from detectron2.engine import DefaultTrainer, DefaultPredictor
from detectron2.config import get_cfg
from detectron2 import model_zoo
from detectron2.utils.visualizer import Visualizer, ColorMode
from detectron2.data.catalog import Metadata

from register_datasets import label_to_idx_seg


input_folder = Path('inference') / 'input'
output_folder = Path('inference') / 'output'
output_folder.mkdir(parents=True, exist_ok=True)

cfg = get_cfg()
cfg.merge_from_file(model_zoo.get_config_file("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml"))
cfg.DATALOADER.NUM_WORKERS = 8
cfg.MODEL.ROI_HEADS.NUM_CLASSES = 4

cfg.MODEL.WEIGHTS = os.path.join("weights", "model_final.pth")
cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5 
predictor = DefaultPredictor(cfg)


metadata = Metadata()
metadata.set(thing_classes = list(label_to_idx_seg.keys()))
for filename in input_folder.iterdir():
    if filename.suffix != '.jpg' and filename.suffix != '.png' and filename.suffix != '.jpeg':
        continue
    im = cv2.imread(str(filename))
    outputs = predictor(im)
    v = Visualizer(im[:, :, ::-1],
                   metadata=metadata, 
                   scale=0.8, 
                   instance_mode=ColorMode.IMAGE_BW   # remove the colors of unsegmented pixels
    )
    v = v.draw_instance_predictions(outputs["instances"].to("cpu"))
    out_path = output_folder / filename.name
    cv2.imwrite(str(out_path), cv2.cvtColor(v.get_image()[:, :, ::-1], cv2.COLOR_BGR2RGB))