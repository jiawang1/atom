/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2015 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 *
 *
 */
package com.atom.constants;

/**
 * Global class for all Atom constants. You can add global constants for your extension into this class.
 */
public final class AtomConstants extends GeneratedAtomConstants
{
	public static final String EXTENSIONNAME = "atom";

	private AtomConstants()
	{
		//empty to avoid instantiating this constant class
	}

	public static final String ATOM_MODE = "atomMode";
	public static final String LESS_ENABLE = "lessEnabled";
	public static final String COMPRESS_ENABLE = "compressEnabled";
	public static final String COMPRESS_JS_PATH = "compressDestJSPath";
	public static final String COMPRESS_CSS_PATH = "compressDestCSSPath";
	public static final String COMPRESS_FILE_SUFFIX = "compressFileSuffix";
}
