'''
Downloading dataset from open street view a large-scale,
open-access dataset comprising over 5.1 million geo-referenced street view images,
covering 225 countries and territories
'''
from huggingface_hub import hf_hub_download

for i in range(2):
    hf_hub_download(
        repo_id="osv5m/osv5m",
        filename=str(i).zfill(2) +'_batch_of_images' + '.zip',
        subfolder="images/test",
        repo_type="dataset",
        local_dir="datasets/OpenWorld"
    )
hf_hub_download(
    repo_id="osv5m/osv5m",
    filename="README.md",
    repo_type="dataset",
    local_dir="datasets/OpenWorld"
)
