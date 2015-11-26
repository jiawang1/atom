/**
 * 
 */
package com.atom.tag;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.jsp.JspTagException;
import com.granule.CompressorSettings;
import com.atom.constants.AtomConstants;


/**
 * @author i054410
 * 
 */
public abstract class AbstractTagHandler
{
	public abstract void process();

	public static void buildHandlerChain(final HttpServletRequest httpRequest)
	{
		final String atomMode = httpRequest.getParameter(AtomConstants.ATOM_MODE);
		final String sLessEnable = httpRequest.getParameter(AtomConstants.LESS_ENABLE);
		final String sCompressEnable = httpRequest.getParameter(AtomConstants.COMPRESS_ENABLE);

		final boolean lessEnable = getBooleanValue(sLessEnable);
		final boolean compressEnable = getBooleanValue(sCompressEnable);
		final boolean granuleEnable = CompressorSettings.getBoolean(httpRequest.getParameter("granule"), false);

		if (granuleEnable && compressEnable)
		{
			throw new JspTagException("granule and atom comtpress can not be enabled together");
		}

	}

	protected boolean getBooleanValue(final String value)
	{

		if (value == null)
		{
			return false;
		}
		return Boolean.valueOf(value).booleanValue();
	}
}
