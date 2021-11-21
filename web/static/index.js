var dropRegion = document.getElementById("drop-region"),
    imagePreviewRegion = document.getElementById("image-preview");
// where images are previewed


// open file selector when clicked on the drop region
var fakeInput = document.createElement("input");
fakeInput.type = "file";
fakeInput.accept = "image/*";
fakeInput.multiple = true;
dropRegion.addEventListener('click', function() {
	fakeInput.click();
});

fakeInput.addEventListener("change", function() {
	var files = fakeInput.files;
	handleFiles(files);
});


function preventDefault(e) {
	e.preventDefault();
  	e.stopPropagation();
}

dropRegion.addEventListener('dragenter', preventDefault, false)
dropRegion.addEventListener('dragleave', preventDefault, false)
dropRegion.addEventListener('dragover', preventDefault, false)
dropRegion.addEventListener('drop', preventDefault, false)


function openModal(modal, id) {
  // Note: fixed elements will also need the margin
  // adjustment (like a fixed header, if you have one).
  var scrollBarWidth = window.innerWidth - document.body.offsetWidth;
  document.body.style.margin = '0px ' + scrollBarWidth + 'px 0px 0px';
  document.body.style.overflow = 'hidden';
  modal.style.display = 'block';
  modalSourceImg.src = results[id]["leaf_blob"]
  modalBerriesImg.src = results[id]["leaf_blob"]
  modalLeafsImg.src = results[id]["leaf_blob"]
  modalResult.innerHTML = JSON.stringify(results[id]["result"])
};

function closeModal(modal) {
	document.body.style.margin = '';
  document.body.style.overflow = '';
  modal.style.display = 'none';
  modalSourceImg.src = ""
};

// I prefer to generate and dynamically insert the modal
// but for this demonstration it is already in the markup.
var modal = document.getElementById('modal');
var modal_inner = document.getElementById('modal-inner')
var modalSourceImg = document.getElementById('modal-source-img')
var modalBerriesImg = document.getElementById('modal-berries-img')
var modalLeafsImg = document.getElementById('modal-leafs-img')
var modalResult = document.getElementById('modal-result')


// Clicking outside the inner modal content should close it.
modal.addEventListener('click', function () {
  closeModal(modal);
});
for (var i = 0; i <  modal.childNodes.length; i++) {
    modal.childNodes[i].addEventListener('click', function (event) {
        event.stopPropagation();
    });
}

function handleDrop(e) {
	var dt = e.dataTransfer,
		files = dt.files;

	if (files.length) {

		handleFiles(files);

	} else {

		// check for img
		var html = dt.getData('text/html'),
	        match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html),
	        url = match && match[1];



	    if (url) {
	        uploadImageFromURL(url);
	        return;
	    }

	}


	function uploadImageFromURL(url) {
		var img = new Image;
        var c = document.createElement("canvas");
        var ctx = c.getContext("2d");

        img.onload = function() {
            c.width = this.naturalWidth;     // update canvas size to match image
            c.height = this.naturalHeight;
            ctx.drawImage(this, 0, 0);       // draw in image
            c.toBlob(function(blob) {        // get content as PNG blob

            	// call our main function
                handleFiles( [blob] );

            }, "image/png");
        };
        img.onerror = function() {
            alert("Error in uploading");
        }
        img.crossOrigin = "";              // if from different origin
        img.src = url;
	}

}

dropRegion.addEventListener('drop', handleDrop, false);



function handleFiles(files) {
	for (var i = 0, len = files.length; i < len; i++) {
		if (validateImage(files[i]))
			previewAnduploadImage(files[i]);
	}
}

function validateImage(image) {
	// check the type
	var validTypes = ['image/jpeg', 'image/png', 'image/gif'];
	if (validTypes.indexOf( image.type ) === -1) {
		alert("Invalid File Type");
		return false;
	}

	// check the size
	var maxSizeInBytes = 10e6; // 10MB
	if (image.size > maxSizeInBytes) {
		alert("File too large");
		return false;
	}

	return true;

}

var results = {}

function previewAnduploadImage(image) {
    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, {type: contentType});
      return blob;
    }

    var cards_container = document.getElementById("cards_container")
	// container
	var articleView = document.createElement("article");
	articleView.className = "card";
	cards_container.appendChild(articleView);


	// previewing image
	var header = document.createElement("h2");
	header.innerHTML = "Loading image..."
	articleView.appendChild(header);

	var img = document.createElement("img");
	articleView.appendChild(img);

	var contentView = document.createElement("div");
	contentView.className = "content";
	contentView.innerHTML = "<p> Loading image... </p>"
	articleView.appendChild(contentView);

	var footer = document.createElement("footer");
	footer.innerHTML = "Image is loading. Wait..."
	articleView.appendChild(footer);

	// progress overlay
	var overlay = document.createElement("div");
	overlay.className = "overlay";
	articleView.appendChild(overlay);
	// read the image...
	var reader = new FileReader();
	reader.onload = function(e) {
		img.src = e.target.result;
	}
	reader.readAsDataURL(image);

	// create FormData
	var formData = new FormData();
	formData.append('image', image);

	// upload the image
	var uploadLocation = 'http://localhost:5000/upload';

	var ajax = new XMLHttpRequest();
	ajax.open("POST", uploadLocation, true);

	ajax.onreadystatechange = function(e) {
		if (ajax.readyState === 4) {
			if (ajax.status === 200) {
			    resp = ajax.response
			    var parsed_json = JSON.parse(resp)
			    var ident = parsed_json.id

			    // get leaf img
			    var contentType = 'image/png';
                var b64Data = parsed_json.leafs_image;
                var blob = b64toBlob(b64Data, contentType);
                var leafBlobUrl = URL.createObjectURL(blob);

                // get berries img
			    var contentType = 'image/png';
                var b64Data = parsed_json.leafs_image;
                var blob = b64toBlob(b64Data, contentType);
                var berriesBlobUrl = URL.createObjectURL(blob);

                // here will be classification results
                class_res = parsed_json.result
                results[ident] = {"source_img":image, "leaf_blob": leafBlobUrl, "berries_blob": berriesBlobUrl, "result": class_res}
                contentView.innerHTML = JSON.stringify(class_res)

			    console.log(ident)
			    articleView.id = ident
			    header.innerHTML = ident
                articleView.addEventListener('click', function (event) {
                  event.preventDefault();
                  openModal(modal, ident);
                });
                footer.innerHTML = "Click to see full info"
			} else {
				// error!
			}
		}
	}

	ajax.upload.onprogress = function(e) {

		// change progress
		// (reduce the width of overlay)

		var perc = (e.loaded / e.total * 100) || 100,
			width = 100 - perc;

		overlay.style.width = width;
	}

	ajax.send(formData);
}