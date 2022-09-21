#!/usr/bin/env python
#coding=utf-8
'''
Author: OhtoAi
Date: 2021-11-01 10:42:08
LastEditors: OhtoAi
LastEditTime: 2021-11-01 11:22:33
Description: file content
'''
from PIL import Image
import os
import sys

def generateThumbail(src, dst = "", size = (200, 200)):
    if len(dst) > 0:
        if dst[-1] == '/' or dst[-1] == '\\':
            dst += os.path.split(src)[-1]
    else:
        dst = os.path.splitext(src)[0] + "_thumb";
    dst = os.path.splitext(dst)[0] + ".png"
    try:
        im = Image.open(src)
    except IOError:
        return
    im = im.convert('RGBA')
            
    width, height = im.size
    if width == height:
        region = im
    else:
        if width > height:
            delta = (width - height)/2
            box = (delta, 0, delta+height, height)
        else:
            delta = (height - width)/2
            box = (0, delta, width, delta+width)                 
        region = im.crop(box)
    region.resize(size, Image.ANTIALIAS).save(dst)

if __name__ == '__main__':
    if len(sys.argv) == 3:
        generateThumbail(sys.argv[1], sys.argv[2])
    elif len(sys.argv) == 2:
        generateThumbail(sys.argv[1])
    else:
        print("Usage {0} <src_image_file> [thumb_image_file | thumb_image_dir]".format(__file__))
