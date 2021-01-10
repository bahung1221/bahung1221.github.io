CMS.registerEditorComponent({
    // Internal id of the component
    id: "figure-image",
    // Visible label
    label: "Figure Image",
    // Fields the user need to fill out when adding an instance of the component
    fields: [
        { name: 'src', label: 'Image', widget: 'image', required: true },
        { name: 'alt', label: 'Alt', widget: 'string', required: true },
        { name: 'caption', label: 'Caption', widget: 'string', required: false },
    ],
    // Pattern to identify a block as being an instance of this component
    pattern: /^<figure.*>\s*<img src="([^"]*)" alt="([^"]*)".*>\s*(?:<figcaption>([^"]*)<\/figcaption>)\s*<\/figure>$/,
    // Function to extract data elements from the regexp match
    fromBlock: function (match) {
        return {
            src: match[1] || '',
            alt: match[2] || '',
            caption: match[3] || '',
        }
    },
    // Function to create a text block from an instance of this component
    toBlock: function (obj) {
        const caption = obj.caption ? `<figcaption>${obj.caption}</figcaption>` : ''

        return '<figure>' +
                    `<img src="${obj.src}" alt="${obj.alt}">` +
                    `${caption}` +
                '</figure>'
    },
    // Preview output for this component. Can either be a string or a React component
    // (component gives better render performance)
    toPreview: function (obj) {
        const caption = obj.caption ? `<figcaption>${obj.caption}</figcaption>` : ''
        
        return '<figure>' +
                    `<img src="${obj.src}" alt="${obj.alt}">` +
                    `${caption}` +
                '</figure>'
    }
})