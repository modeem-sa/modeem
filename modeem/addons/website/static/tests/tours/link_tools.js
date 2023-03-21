/** @modeem-module */

import wTourUtils from 'website.tour_utils';

const clickOnImgStep = {
    content: "Click somewhere else to save.",
    trigger: 'iframe #wrap .s_text_image img',
};

wTourUtils.registerWebsitePreviewTour('link_tools', {
    test: true,
    url: '/',
    edition: true,
}, [
    // 1. Create a new link from scratch.
    wTourUtils.dragNDrop({
        id: 's_text_image',
        name: 'Text - Image',
    }),
    {
        content: "Replace first paragraph, to insert a new link",
        trigger: 'iframe #wrap .s_text_image p',
        run: 'text Go to modeem: '
    },
    {
        content: "Open link tools",
        trigger: "#toolbar #create-link",
    },
    {
        content: "Type the link URL modeem.com",
        trigger: '#o_link_dialog_url_input',
        run: 'text modeem.com'
    },
    clickOnImgStep,
    // 2. Edit the link with the link tools.
    {
        content: "Click on the newly created link, change content to modeem website",
        trigger: 'iframe .s_text_image a[href="http://modeem.com"]:contains("modeem.com")',
        run: 'text modeem website',
    },
    {
        content: "Link tools, should be open, change the url",
        trigger: '#o_link_dialog_url_input',
        run: 'text modeem.be'
    },

    clickOnImgStep,
    ...wTourUtils.clickOnSave(),
    // 3. Edit a link after saving the page.
    wTourUtils.clickOnEdit(),
    {
        content: "The new link content should be modeem website and url modeem.be",
        extra_trigger: "#oe_snippets.o_loaded",
        trigger: 'iframe .s_text_image a[href="http://modeem.be"]:contains("modeem website")',
    },
    {
        content: "The new link content should be modeem website and url modeem.be",
        trigger: '#toolbar button[data-bs-original-title="Link Style"]',
    },
    {
        // When doing automated testing, the link popover takes time to
        // hide. While hidding, the editor observer is unactive in order to
        // prevent the popover mutation to be recorded. In a manual
        // scenario, the popover has plenty of time to be hidden and the
        // obsever would be re-activated in time. As this problem arise only
        // in test, we make sure the popover is hidden
        trigger: 'iframe html:not(:has(.popover))',
        run: () => null, // it's a check
    },
    {
        content: "Click on the secondary style button.",
        trigger: '#toolbar we-button[data-value="secondary"]',
    },
    ...wTourUtils.clickOnSave(),
    {
        content: "The link should have the secondary button style.",
        trigger: 'iframe .s_text_image a.btn.btn-secondary[href="http://modeem.be"]:contains("modeem website")',
        run: () => {}, // It's a check.
    },
    // 4. Add link on image.
    wTourUtils.clickOnEdit(),
    {
        content: "Click on image.",
        trigger: 'iframe .s_text_image img',
        extra_trigger: '#oe_snippets.o_loaded',
    },
    {
        content: "Activate link.",
        trigger: '.o_we_customize_panel we-row:contains("Media") we-button.fa-link',
    },
    {
        content: "Set URL.",
        trigger: '.o_we_customize_panel we-input:contains("Your URL") input',
        run: 'text modeem.com',
    },
    {
        content: "Deselect image.",
        trigger: 'iframe .s_text_image p',
    },
    {
        content: "Re-select image.",
        trigger: 'iframe .s_text_image img',
    },
    {
        content: "Check that link tools appear.",
        trigger: 'iframe .popover div a:contains("http://modeem.com")',
        run: () => {}, // It's a check.
    },
    // 5. Remove link from image.
    {
        content: "Remove link.",
        trigger: 'iframe .popover:contains("http://modeem.com") a .fa-chain-broken',
    },
    {
        content: "Check that image is not within a link anymore.",
        trigger: 'iframe .s_text_image div > img',
        run: () => {}, // It's a check.
    },
]);
