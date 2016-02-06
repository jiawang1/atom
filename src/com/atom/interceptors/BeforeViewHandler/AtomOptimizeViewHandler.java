package com.atom.interceptors.BeforeViewHandler;

import de.hybris.platform.acceleratorservices.config.SiteConfigService;
import de.hybris.platform.addonsupport.interceptors.BeforeViewHandlerAdaptee;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.ui.ModelMap;

import com.atom.constants.AtomConstants;


/**
 */
public class AtomOptimizeViewHandler implements BeforeViewHandlerAdaptee
{
	private SiteConfigService siteConfigService;

	protected SiteConfigService getSiteConfigService()
	{
		return siteConfigService;
	}

	@Required
	
	public void setSiteConfigService(final SiteConfigService siteConfigService)
	{
		this.siteConfigService = siteConfigService;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * de.hybris.platform.addonsupport.interceptors.BeforeViewHandlerAdaptee#beforeView(javax.servlet.http.HttpServletRequest
	 * , javax.servlet.http.HttpServletResponse, org.springframework.ui.ModelMap, java.lang.String)
	 */
	@Override
	public String beforeView(final HttpServletRequest request, final HttpServletResponse response, final ModelMap model,
			final String viewName) throws Exception
	{

		final HttpSession session = request.getSession();

		if (session.getAttribute(AtomConstants.ATOM_MODE) == null)
		{
			session.setAttribute(AtomConstants.ATOM_MODE, Boolean.valueOf(getSiteConfigService()
					.getBoolean("development.mode", false)));
		}

		if (session.getAttribute(AtomConstants.LESS_ENABLE) == null)
		{
			session.setAttribute(AtomConstants.LESS_ENABLE,
					Boolean.valueOf(getSiteConfigService().getBoolean("atom.config.LESS.enabled", false)));
		}

		if (session.getAttribute(AtomConstants.COMPRESS_ENABLE) == null)
		{
			session.setAttribute(AtomConstants.COMPRESS_ENABLE,
					Boolean.valueOf(getSiteConfigService().getBoolean("atom.config.compress.enabled", false)));
		}
		
		if(((Boolean)session.getAttribute(AtomConstants.COMPRESS_ENABLE)).booleanValue()){
			
			if(session.getAttribute(AtomConstants.COMPRESS_JS_PATH) == null){
				session.setAttribute(AtomConstants.COMPRESS_JS_PATH,
						getSiteConfigService().getString("atom.config.compress.js.dest.filePath",""));
			}
			
			if(session.getAttribute(AtomConstants.COMPRESS_CSS_PATH) == null){
				session.setAttribute(AtomConstants.COMPRESS_CSS_PATH,
						getSiteConfigService().getString("atom.config.compress.css.dest.filePath",""));
			}
		}
		
		if(session.getAttribute(AtomConstants.COMPRESS_FILE_SUFFIX) == null){
			RequestDispatcher requestDispatcher = request.getServletContext().getRequestDispatcher("/WEB-INF/tags/shared/variables/generateCompressName.jsp");
			requestDispatcher.include(request, response);
		}
		
		return viewName;
	}

}
