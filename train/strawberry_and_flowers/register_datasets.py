import pandas as pd
import random
import json
from typing import List, Dict
from pathlib import Path

from detectron2.data import DatasetCatalog, MetadataCatalog
from detectron2.structures import BoxMode


train_dataset_name = 'shields_dataset_train'
test_dataset_name = 'shields_dataset_test'

label_to_idx_seg = {
    'flower' : 0, # seg
    '1': 1,
    '2': 2,
    '3': 3
}

idx_to_label_seg = {v: k for k, v in label_to_idx_seg.items()}

def register():
    labels = pd.read_csv('labels_flowers_and_straw.csv')
    my_dataset = []
    for img_name in labels['filename'].unique():
        img_data = labels[labels.filename == img_name]
        img_properties = {}
        img_properties['file_name'] = str(Path('data') / img_name)
        img_properties['height'] = img_data['height'].values[0]
        img_properties['width'] = img_data['width'].values[0]
        img_properties['image_id'] = img_name
        img_properties['annotations'] = []
        for index, row in img_data.iterrows():
            shape_attr = json.loads(row['region_shape_attributes'])
            region_class = json.loads(row['region_attributes'])

            annot = {}

            annot['bbox_mode'] = BoxMode.XYXY_ABS
            annot['category_id'] = label_to_idx_seg[region_class['class']]
            if annot['category_id'] == 0 or annot['category_id'] == 1 or annot['category_id'] == 2 or annot['category_id'] == 3:
                # instance segmentation
                segm = [[]]
                x_min, x_max, y_min, y_max = 1000000, -1, 1000000, -1
                for x, y in zip(shape_attr['all_points_x'], shape_attr['all_points_y']):
                    if x < x_min:
                        x_min = x
                    if x > x_max:
                        x_max = x
                    if y < y_min:
                        y_min = y
                    if y > y_max:
                        y_max = y
                    segm[0].append(x)
                    segm[0].append(y)
                annot['segmentation'] = segm
                annot['bbox'] = [x_min, y_min, x_max, y_max]
            else:
                # just detecton
                continue
            img_properties['annotations'].append(annot)
        my_dataset.append(img_properties)

    random.shuffle(my_dataset)

    def shields_dataset_function_train() -> List[Dict]:
        return my_dataset[:-50]

    def shields_dataset_function_test() -> List[Dict]:
        return my_dataset[-50:]

    DatasetCatalog.register(train_dataset_name, shields_dataset_function_train)
    DatasetCatalog.register(test_dataset_name, shields_dataset_function_test)
    MetadataCatalog.get(train_dataset_name).thing_classes = list(label_to_idx_seg.keys())
    MetadataCatalog.get(test_dataset_name).thing_classes = list(label_to_idx_seg.keys())