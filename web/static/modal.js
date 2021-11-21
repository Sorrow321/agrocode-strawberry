function openModal(modal, id) {
  // Note: fixed elements will also need the margin
  // adjustment (like a fixed header, if you have one).
  var scrollBarWidth = window.innerWidth - document.body.offsetWidth;
  document.body.style.margin = '0px ' + scrollBarWidth + 'px 0px 0px';
  document.body.style.overflow = 'hidden';
  modal.style.display = 'block';
};

function closeModal(modal) {
	document.body.style.margin = '';
  document.body.style.overflow = '';
  modal.style.display = 'none';
};

// I prefer to generate and dynamically insert the modal
// but for this demonstration it is already in the markup.
var modal = document.getElementById('modal');

// Clicking outside the inner modal content should close it.
modal.addEventListener('click', function () {
  closeModal(modal);
});
for (var i = 0; i <  modal.childNodes.length; i++) {
	modal.childNodes[i].addEventListener('click', function (event) {
		event.stopPropagation();
	});
}

articles = document.getElementsByClassName('card');
for (var i = 0; i < articles.length; i++) {
    articles[i].addEventListener('click', function (event) {
      event.preventDefault();
      openModal(modal, event.target.id);
    });
}


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