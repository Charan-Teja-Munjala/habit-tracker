module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            [
                'babel-preset-expo',
                {
                    unstable_transformImportMeta: true,
                },
            ],
        ],
        // react-native-reanimated v4 no longer needs the plugin here;
        // it's handled internally by babel-preset-expo
    };
};
