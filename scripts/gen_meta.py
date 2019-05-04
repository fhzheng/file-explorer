#! /usr/bin/python
import os
import sys
import glob
import json
walk_dir = sys.argv[1]
walk_dir = os.path.abspath(walk_dir)
meta_path = os.path.join(walk_dir, '.meta')
if not os.path.exists(meta_path):
    os.makedirs(meta_path)

for filename in glob.iglob(pathname=walk_dir + '**/**', recursive=True):
    if os.path.isfile(filename):
        statinfo = os.stat(filename)
        info = {
            "size": statinfo.st_size,
            "mtime": statinfo.st_mtime,
            "name": os.path.basename(filename),
        }
        meta_file = os.path.join(
            meta_path, filename[len(walk_dir) + 1:] + ".json")
        if not os.path.exists(meta_file):
            if not os.path.exists(os.path.dirname(meta_file)):
                os.makedirs(os.path.dirname(meta_file))
            with open(meta_file, 'w+') as f:
                f.write(json.dumps(info, ensure_ascii=False))
        print(info, meta_file)
